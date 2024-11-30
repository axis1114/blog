FROM alpine:latest

WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache ca-certificates tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

# 创建必要的目录
RUN mkdir -p /app/uploads

# 复制二进制文件和配置
COPY backend/blog_server .
COPY backend/settings.yaml .

# 设置权限
RUN chmod +x /app/blog_server

EXPOSE 8888

ENTRYPOINT ["./blog_server"]