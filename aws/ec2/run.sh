# install docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# run containers

sudo docker run --name mongodb \
-e MONGO_INITDB_ROOT_USERNAME=yachat \
-e MONGO_INITDB_ROOT_PASSWORD=***REMOVED*** \
-v /data/mongodb:/data/db \
--network yachat-network \
-p 27017:27017 \
-d \
mongo:latest

sudo docker run --name mongodb-express \
-e ME_CONFIG_MONGODB_SERVER=mongodb \
-e ME_CONFIG_MONGODB_ADMINUSERNAME=yachat \
-e ME_CONFIG_MONGODB_ADMINPASSWORD=***REMOVED*** \
-e ME_CONFIG_BASICAUTH_USERNAME=yachat \
-e ME_CONFIG_BASICAUTH_PASSWORD=***REMOVED*** \
--network yachat-network \
-p 8081:8081 \
-d \
mongo-express:latest
