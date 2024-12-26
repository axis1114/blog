package models

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"blog/global"

	"github.com/elastic/go-elasticsearch/v8/typedapi/types"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types/enums/refresh"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types/enums/sortorder"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
)

// Article 文章模型
type Article struct {
	ID            string    `json:"id"`
	CreatedAt     time.Time `json:"created_at"`     // 创建时间
	UpdatedAt     time.Time `json:"updated_at"`     // 更新时间
	Title         string    `json:"title"`          // 文章标题
	Abstract      string    `json:"abstract"`       // 文章简介
	Content       string    `json:"content"`        // 文章内容
	LookCount     uint      `json:"look_count"`     // 浏览量
	CommentCount  uint      `json:"comment_count"`  // 评论量
	DiggCount     uint      `json:"digg_count"`     // 点赞量
	CollectsCount uint      `json:"collects_count"` // 收藏量
	UserID        uint      `json:"user_id"`        // 用户id
	UserName      string    `json:"user_name"`      // 用户昵称
	Category      string    `json:"category"`       // 文章分类
	CoverID       uint      `json:"cover_id"`       // 封面id
	CoverURL      string    `json:"cover_url"`      // 封面
	Version       int64     `json:"version"`        // 版本号
}

const (
	articleIndex = "article_index"
	cacheTTL     = time.Hour * 2
	batchSize    = 1000
	timeout      = time.Second * 5
)

// ArticleService 文章服务
type ArticleService struct {
	ctx        context.Context
	cache      *redis.Client
	retryCount int
	retryDelay time.Duration
	mu         sync.RWMutex
}

// SearchParams 搜索参数
type SearchParams struct {
	PageInfo
	Category  string `json:"category" form:"category"`
	SortField string `json:"sort_field" form:"sort_field"`
	SortOrder string `json:"sort_order" form:"sort_order"`
}

// SearchResult 搜索结果
type SearchResult struct {
	Articles []Article
	Total    int64
}

// NewArticleService 创建文章服务实例
func NewArticleService() *ArticleService {
	return &ArticleService{
		ctx:        context.Background(),
		cache:      global.Redis,
		retryCount: 3,
		retryDelay: time.Millisecond * 100,
	}
}

// CreateIndex 创建索引
func (s *ArticleService) CreateIndex() error {
	if s.ctx == nil {
		s.ctx = context.Background()
	}

	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	exist, err := s.IndexExists()
	if err != nil {
		return fmt.Errorf("检查索引是否存在失败: %w", err)
	}

	if exist {
		if err := s.DeleteIndex(); err != nil {
			return fmt.Errorf("删除已存在的索引失败: %w", err)
		}
	}

	// 索引映射
	properties := map[string]types.Property{
		"title":          types.NewTextProperty(),
		"abstract":       types.NewTextProperty(),
		"content":        types.NewTextProperty(),
		"category":       types.NewKeywordProperty(),
		"created_at":     types.NewDateProperty(),
		"updated_at":     types.NewDateProperty(),
		"look_count":     types.NewIntegerNumberProperty(),
		"comment_count":  types.NewIntegerNumberProperty(),
		"digg_count":     types.NewIntegerNumberProperty(),
		"collects_count": types.NewIntegerNumberProperty(),
		"user_id":        types.NewIntegerNumberProperty(),
		"user_name":      types.NewKeywordProperty(),
		"cover_id":       types.NewIntegerNumberProperty(),
		"cover_url":      types.NewKeywordProperty(),
		"version":        types.NewLongNumberProperty(),
	}

	_, err = global.Es.Indices.Create(articleIndex).
		Mappings(&types.TypeMapping{
			// 设置索引的映射规则
			Properties: properties,
		}).
		Do(ctx)

	if err != nil {
		return fmt.Errorf("创建索引失败: %w", err)
	}
	global.Log.Info("创建索引成功")
	return nil
}

// IndexExists 检查索引是否存在
func (s *ArticleService) IndexExists() (bool, error) {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	resp, err := global.Es.Indices.Exists(articleIndex).Do(ctx)
	if err != nil {
		return false, fmt.Errorf("检查索引是否存在失败: %w", err)
	}
	return resp, nil
}

// DeleteIndex 删除索引
func (s *ArticleService) DeleteIndex() error {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	_, err := global.Es.Indices.Delete(articleIndex).Do(ctx)
	if err != nil {
		return fmt.Errorf("删除索引失败: %w", err)
	}
	return nil
}

// CreateArticle 创建文章
func (s *ArticleService) CreateArticle(article *Article) error {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()
	exists, err := s.ArticleExists(article.ID)
	if err != nil {
		return fmt.Errorf("检查文章是否存在失败: %w", err)
	}
	if exists {
		return fmt.Errorf("文章已存在")
	}
	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()
	article.Version = 1

	_, err = global.Es.Index(articleIndex).
		Id(article.ID).
		Document(article).
		Refresh(refresh.True). // 刷新索引，确保文章立即可见
		Do(ctx)

	if err != nil {
		return fmt.Errorf("创建文章失败: %w", err)
	}

	// 设置缓存
	return s.setCache(article.ID, article)
}

// GetArticle 获取文章
func (s *ArticleService) GetArticle(id string) (*Article, error) {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	// 1. 优先从缓存获取
	article, err := s.getCache(id)
	if err == nil {
		return article, nil
	}

	// 2. 使用重试机制从 ES 获取文章
	var result Article
	resp, err := global.Es.Get(articleIndex, id).Do(ctx)
	if err != nil {
		return nil, fmt.Errorf("获取文章失败: %w", err)
	} else {
		if err := json.Unmarshal(resp.Source_, &result); err != nil {
			return nil, fmt.Errorf("解析文章数据失败: %w", err)
		}
	}

	// 4. 更新访问计数
	if err := s.IncrementLookCount(id); err != nil {
		global.Log.Error("更新访问计数失败",
			zap.String("id", id),
			zap.Error(err))
	}

	// 5. 设置缓存
	if shouldCache(result.LookCount) {
		if err := s.setCache(id, &result); err != nil {
			global.Log.Error("设置缓存失败",
				zap.String("id", id),
				zap.Error(err))
		}
	}

	return &result, nil
}

// shouldCache 判断是否应该缓存文章
func shouldCache(lookCount uint) bool {
	// 根据访问量决定是否缓存
	return lookCount > 50 ||
		lookCount > 10 && time.Now().Hour() >= 8 && time.Now().Hour() <= 22 // 工作时间内的次热门文章
}

// UpdateArticle 更新文章
func (s *ArticleService) UpdateArticle(article *Article) error {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	article.Version++
	article.UpdatedAt = time.Now()

	_, err := global.Es.Update(articleIndex, article.ID).
		Doc(article).
		Refresh(refresh.True).
		Do(ctx)

	if err != nil {
		return fmt.Errorf("更新文章失败: %w", err)
	}

	// 更新缓存
	return s.setCache(article.ID, article)
}

// DeleteArticles 批量删除文章
func (s *ArticleService) DeleteArticles(ids []string) error {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()
	g, ctx := errgroup.WithContext(ctx)

	for i := 0; i < len(ids); i += batchSize {
		end := i + batchSize
		if end > len(ids) {
			end = len(ids)
		}

		batch := ids[i:end]

		// 构建批量删除请求
		bulkRequest := global.Es.Bulk().Index(articleIndex)
		for _, id := range batch {
			bulkRequest.DeleteOp(types.DeleteOperation{Id_: &id})
		}

		// 执行批量删除请求
		g.Go(func() error {
			resp, err := bulkRequest.Refresh(refresh.True).Do(ctx)
			if err != nil {
				return fmt.Errorf("批量删除文章失败: %w", err)
			}

			if resp.Errors {
				return fmt.Errorf("批量删除文章时发生错误")
			}

			// 删除缓存
			for _, id := range batch {
				if err := s.deleteCache(id); err != nil {
					global.Log.Error("删除缓存失败",
						zap.String("id", id),
						zap.Error(err))
				}
			}
			return nil
		})
	}

	return g.Wait()
}

// SearchArticles 搜索文章
func (s *ArticleService) SearchArticles(params SearchParams) (*SearchResult, error) {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	boolQuery := types.NewBoolQuery()

	if params.PageInfo.Key != "" {
		multiMatchQuery := types.NewMultiMatchQuery()
		multiMatchQuery.Query = params.PageInfo.Key
		multiMatchQuery.Fields = []string{"title^3", "abstract^2", "content"}
		boolQuery.Must = append(boolQuery.Must, types.Query{MultiMatch: multiMatchQuery})
	}

	if params.Category != "" {
		termQuery := types.NewTermQuery()
		termQuery.Value = params.Category
		boolQuery.Must = append(boolQuery.Must, types.Query{Term: map[string]types.TermQuery{"category": *termQuery}})
	}

	from := (params.PageInfo.Page - 1) * params.PageInfo.PageSize

	sortField := params.SortField
	sortOrder := params.SortOrder

	if sortField == "" {
		sortField = "created_at"
	}

	if sortOrder == "" {
		sortOrder = "desc"
	}

	searchRequest := global.Es.Search().
		Index(articleIndex).
		Query(&types.Query{Bool: boolQuery}).
		Sort(types.SortOptions{
			SortOptions: map[string]types.FieldSort{
				sortField: {Order: &sortorder.SortOrder{Name: sortOrder}},
			},
		}).
		From(from).
		Size(params.PageInfo.PageSize)

	resp, err := searchRequest.Do(ctx)
	if err != nil {
		return nil, fmt.Errorf("搜索文章失败: %w", err)
	}

	articles := make([]Article, 0)
	for _, hit := range resp.Hits.Hits {
		var article Article
		if err := json.Unmarshal(hit.Source_, &article); err != nil {
			global.Log.Error("解析文章数据失败", zap.Error(err))
			continue
		}
		articles = append(articles, article)
	}
	return &SearchResult{
		Articles: articles,
		Total:    resp.Hits.Total.Value,
	}, nil
}

// 缓存相关方法
func (s *ArticleService) getCacheKey(id string) string {
	return fmt.Sprintf("article:%s", id)
}

func (s *ArticleService) getCache(id string) (*Article, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	key := s.getCacheKey(id)
	data, err := s.cache.Get(s.ctx, key).Bytes()
	if err != nil {
		return nil, err
	}

	var article Article
	if err := json.Unmarshal(data, &article); err != nil {
		return nil, err
	}

	return &article, nil
}

func (s *ArticleService) setCache(id string, article *Article) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := json.Marshal(article)
	if err != nil {
		return err
	}

	key := s.getCacheKey(id)
	return s.cache.Set(s.ctx, key, data, cacheTTL).Err()
}

func (s *ArticleService) deleteCache(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	key := s.getCacheKey(id)
	return s.cache.Del(s.ctx, key).Err()
}

// ArticleExists 检查文章是否存在
func (s *ArticleService) ArticleExists(id string) (bool, error) {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	// 先检查缓存
	_, err := s.getCache(id)
	if err == nil {
		return true, nil
	}

	// 缓存不存在，检查 ES
	exists, err := global.Es.Exists(articleIndex, id).Do(ctx)
	if err != nil {
		return false, fmt.Errorf("检查文章是否存在失败: %w", err)
	}

	return exists, nil
}

// ArticleStats 文章统计数据
type ArticleStats struct {
	TotalArticles int64 `json:"total_articles"` // 文章总数
	TotalComments int64 `json:"total_comments"` // 评论数
	TotalViews    int64 `json:"total_views"`    // 总浏览量
	TotalDiggs    int64 `json:"total_diggs"`    // 总点赞数
	TotalCollects int64 `json:"total_collects"` // 总收藏数
}

// GetArticleStats 获取文章统计数据
func (s *ArticleService) GetArticleStats() (*ArticleStats, error) {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	// 从缓存获取统计数据
	stats, err := s.getStatsFromCache()
	if err == nil {
		return stats, nil
	}

	// 构建聚合查询
	aggs := map[string]types.Aggregations{
		"total_comments": {
			Sum: &types.SumAggregation{
				Field: &[]string{"comment_count"}[0],
			},
		},
		"total_views": {
			Sum: &types.SumAggregation{
				Field: &[]string{"look_count"}[0],
			},
		},
		"total_diggs": {
			Sum: &types.SumAggregation{
				Field: &[]string{"digg_count"}[0],
			},
		},
		"total_collects": {
			Sum: &types.SumAggregation{
				Field: &[]string{"collects_count"}[0],
			},
		},
	}

	// 执行查询
	resp, err := global.Es.Search().
		Index(articleIndex).
		Size(0). // 我们只需要聚合结果
		Aggregations(aggs).
		Do(ctx)

	if err != nil {
		return nil, fmt.Errorf("获取统计数据失败: %w", err)
	}

	// 解析结果
	stats = &ArticleStats{
		TotalArticles: resp.Hits.Total.Value,
	}

	if commentAgg, found := resp.Aggregations["total_comments"]; found {
		var sumAgg types.SumAggregate
		commentBytes, _ := json.Marshal(commentAgg)
		if err := json.Unmarshal(commentBytes, &sumAgg); err == nil {
			stats.TotalComments = int64(sumAgg.Value)
		}
	}

	if viewsAgg, found := resp.Aggregations["total_views"]; found {
		var sumAgg types.SumAggregate
		viewBytes, _ := json.Marshal(viewsAgg)
		if err := json.Unmarshal(viewBytes, &sumAgg); err == nil {
			stats.TotalViews = int64(sumAgg.Value)
		}
	}

	if diggsAgg, found := resp.Aggregations["total_diggs"]; found {
		var sumAgg types.SumAggregate
		diggsBytes, _ := json.Marshal(diggsAgg)
		if err := json.Unmarshal(diggsBytes, &sumAgg); err == nil {
			stats.TotalDiggs = int64(sumAgg.Value)
		}
	}

	if collectsAgg, found := resp.Aggregations["total_collects"]; found {
		var sumAgg types.SumAggregate
		collectsBytes, _ := json.Marshal(collectsAgg)
		if err := json.Unmarshal(collectsBytes, &sumAgg); err == nil {
			stats.TotalCollects = int64(sumAgg.Value)
		}
	}

	// 缓存统计数据
	go s.cacheStats(stats)

	return stats, nil
}

// getStatsFromCache 从缓存获取统计数据
func (s *ArticleService) getStatsFromCache() (*ArticleStats, error) {
	data, err := s.cache.Get(s.ctx, "article:stats").Bytes()
	if err != nil {
		return nil, err
	}

	var stats ArticleStats
	if err := json.Unmarshal(data, &stats); err != nil {
		return nil, err
	}

	return &stats, nil
}

// cacheStats 缓存统计数据
func (s *ArticleService) cacheStats(stats *ArticleStats) {
	data, err := json.Marshal(stats)
	if err != nil {
		global.Log.Error("序列化统计数据失败", zap.Error(err))
		return
	}

	// 缓存 5 分钟
	if err := s.cache.Set(s.ctx, "article:stats", data, time.Minute*5).Err(); err != nil {
		global.Log.Error("缓存统计数据失败", zap.Error(err))
	}
}

// IncrementCount 更新指定计数字段
func (s *ArticleService) IncrementCount(id string, field string, increment int) error {
	ctx, cancel := context.WithTimeout(s.ctx, timeout)
	defer cancel()

	// 1. 更新 ES 中的数据
	script := fmt.Sprintf("ctx._source.%s += params.increment", field)
	_, err := global.Es.Update(articleIndex, id).
		Script(&types.InlineScript{
			Source: script,
			Params: map[string]json.RawMessage{
				"increment": json.RawMessage(fmt.Sprintf("%d", increment)),
			},
		}).
		Refresh(refresh.True).
		Do(ctx)

	if err != nil {
		return fmt.Errorf("更新%s失败: %w", field, err)
	}

	// 2. 更新缓存
	article, err := s.GetArticle(id)
	if err != nil {
		global.Log.Error("获取文章失败",
			zap.String("id", id),
			zap.Error(err))
		return nil
	}

	return s.setCache(id, article)
}

// IncrementLookCount 增加浏览量
func (s *ArticleService) IncrementLookCount(id string) error {
	return s.IncrementCount(id, "look_count", 1)
}

// IncrementCommentCount 增加评论量
func (s *ArticleService) IncrementCommentCount(id string) error {
	return s.IncrementCount(id, "comment_count", 1)
}

// IncrementDiggCount 增加点赞量
func (s *ArticleService) IncrementDiggCount(id string) error {
	return s.IncrementCount(id, "digg_count", 1)
}

// IncrementCollectsCount 增加收藏量
func (s *ArticleService) IncrementCollectsCount(id string) error {
	return s.IncrementCount(id, "collects_count", 1)
}

// DecrementCount 减少指定计数字段
func (s *ArticleService) DecrementCount(id string, field string) error {
	return s.IncrementCount(id, field, -1)
}

// DecrementDiggCount 减少点赞量（取消点赞）
func (s *ArticleService) DecrementDiggCount(id string) error {
	return s.DecrementCount(id, "digg_count")
}

// DecrementCollectsCount 减少收藏量（取消收藏）
func (s *ArticleService) DecrementCollectsCount(id string) error {
	return s.DecrementCount(id, "collects_count")
}
