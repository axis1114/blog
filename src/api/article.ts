// 导入基础响应类型和通用类型定义
import { baseResponse, listDataType, paramsType, useAxios } from ".";

// 文章数据类型接口定义
export interface articleType {
  id: string; // 文章唯一标识
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  title: string; // 文章标题
  abstract: string; // 文章摘要
  content: string; // 文章内容
  look_count: number; // 浏览次数
  comment_count: number; // 评论数量
  digg_count: number; // 点赞数量
  collects_count: number; // 收藏数量
  user_id: number; // 作者ID
  user_name: string; // 作者名称
  category: string; // 文章分类
  cover_id: number; // 封面图片ID
  cover_url: string; // 封面图片URL
  version: number; // 版本号
}

// 文章列表查询参数接口，继承自基础查询参数
export interface articleParamsType extends paramsType {
  category?: string; // 可选的分类筛选
  sort_field?: string; // 排序字段
  sort_order?: string; // 排序方式（升序/降序）
}

// 获取文章列表
export function articleList(
  params?: articleParamsType
): Promise<baseResponse<listDataType<articleType>>> {
  return useAxios.get("/api/article/list", { params: { ...params } });
}

// 获取文章详情
export function articleDetail(id: string): Promise<baseResponse<articleType>> {
  return useAxios.get(`/api/article/${id}`);
}

// 创建文章所需的数据类型
export interface articleCreateType {
  title: string; // 文章标题
  abstract: string; // 文章摘要
  category: string; // 文章分类
  content: string; // 文章内容
  cover_id: number; // 封面图片ID
}

// 创建文章
export function articleCreate(
  data: articleCreateType
): Promise<baseResponse<string>> {
  return useAxios.post("/api/article", data);
}

// 更新文章所需的数据类型
export interface articleUpdateType {
  id: string; // 文章ID
  title: string; // 文章标题
  abstract: string; // 文章摘要
  content: string; // 文章内容
  category: string; // 文章分类
  cover_id: number; // 封面图片ID
}

// 更新文章
export function articleUpdate(
  data: articleUpdateType
): Promise<baseResponse<string>> {
  return useAxios.put("/api/article", data);
}

// 批量删除文章的参数类型
export interface DeleteParams {
  id_list: string[]; // 要删除的文章ID列表
}

// 删除文章
export function articleDelete(
  data: DeleteParams
): Promise<baseResponse<string>> {
  return useAxios.post(`/api/article/delete`, data);
}
