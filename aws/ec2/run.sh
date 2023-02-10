# install docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# run containers

sudo docker run --name mongodb \
-e MONGO_INITDB_ROOT_USERNAME=user \
-e MONGO_INITDB_ROOT_PASSWORD=pass \
-v /data/mongodb:/data/db \
--network yachat-network \
-p 27017:27017 \
-d \
mongo:latest

sudo docker run --name mongodb-express \
-e ME_CONFIG_MONGODB_SERVER=mongodb \
-e ME_CONFIG_MONGODB_ADMINUSERNAME=user \
-e ME_CONFIG_MONGODB_ADMINPASSWORD=pass \
-e ME_CONFIG_BASICAUTH_USERNAME=user \
-e ME_CONFIG_BASICAUTH_PASSWORD=pass \
--network yachat-network \
-p 8081:8081 \
-d \
mongo-express:latest
