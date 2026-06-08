FROM nginx:1.27-alpine
COPY nginx.ssl-params.conf nginx.host.conf nginx.docker.conf /etc/nginx/gateway/
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
