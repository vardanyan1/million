FROM node:18.16.0-alpine as build
WORKDIR /app
# ENV PATH /app/node_modules/.bin:$PATH

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

COPY package.json .
COPY yarn.lock .

RUN yarn
COPY . .
RUN yarn build

# production environment
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/build .
# new
# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]