FROM nginx:stable-alpine3.17

COPY ./dist /usr/share/nginx/html
COPY ./docker/nginx-conf/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
