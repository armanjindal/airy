#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

source /vagrant/scripts/lib/k8s.sh
APP_IMAGE_TAG="${AIRY_VERSION:-latest}"

mkdir -p ~/airy-core
cd /vagrant
cp -u airy.conf.tpl airy.conf
cp -R /vagrant/helm-chart ~/airy-core/

echo "Deploying the Airy Core Platform with the ${APP_IMAGE_TAG} image tag"

cd /vagrant/scripts/
wait-for-service-account

if [ -f "/vagrant/airy.conf" ]; then
    cp /vagrant/airy.conf ~/airy-core/helm-chart/values.yaml
    
fi

helm install core ~/airy-core/helm-chart/ -f ~/airy-core/helm-chart/values.yaml --version 0.5.0 --timeout 1000s

kubectl run startup-helper --image busybox --command -- /bin/sh -c "tail -f /dev/null"

wait-for-running-pod startup-helper
wait-for-service startup-helper zookeeper 2181 15 ZooKeeper
wait-for-service startup-helper kafka 9092 15 Kafka
kubectl cp provision/create-topics.sh kafka-0:/tmp
kubectl exec kafka-0 -- /tmp/create-topics.sh

kubectl scale deployment postgres --replicas=1
wait-for-service startup-helper postgres 5432 10 Postgres

kubectl scale statefulset redis-cluster --replicas=1
wait-for-service startup-helper redis-cluster 6379 10 Redis
kubectl delete pod startup-helper --force 2>/dev/null

echo "Deploying ingress controller"
kubectl apply -f ../network/ingress.yaml
