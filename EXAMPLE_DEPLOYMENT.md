# Kubernetes Example Config

## Deployments

### webapp-deployment.yml

```shell
apiVersion: apps/v1 # Specifies the kubernetes version to use, which determines the features available, e.g. rolling deployments.
kind: Deployment # As opposed to just Pod which stay down once failed, this will manage pod deployments to ensure service availability
metadata:
  name: webapp-deployment
  labels:
    app: webapp
spec: # Short for specification
  replicas: 1
  selector:
    matchLabels:
      app: webapp # Specifies the labels of the pods which will be selected by the deployment
  template: # template describes a pod
    metadata:
      labels:
        app: webapp  # The label for the pod
    spec:
      containers:  # specifies the pod container/s
      - name: webapp
        image: my-rego-app
        imagePullPolicy: Never # do not pull from Docker hub
        ports:
        - containerPort: 3000

```

### mongo-deployment.yml

```shell
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo-deployment
  labels:
    app: mongo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
      - name: mongodb
        image: mongo
        ports:
        - containerPort: 27017
        # Additional from ws recording
        volumeMounts:
        - name: mongo-storage
          mountPath: /data/db
        volumes:
        - name: mongo-storage
          persistentVolumeChain:
            claimName: mongo-pvc   #persistent-volume-claim

```

### Persistent volume claim definition

#### mongo-pvc.yml

```shell
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### mongo-service.yml

```shell
apiVersion: v1
kind: Service
metadata:
  name: mongo-service
spec:
  selector:
    app: mongo
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017

```

## Service

A service exposes a cluster of pods to a network.

Default type  is ClusterIP, making the pod accessible only within the cluster

### webapp-service.yml

```shell
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  type: LoadBalancer
  selector:
    app: webapp # Service controller will scan pods to match this selecter, and set the endpoints for the service
  ports:
    - protocol: TCP
      port: 3000 # The exposed service port, so this service can be accessed within the cluster
      targetPort: 3000 # The exposed port on the container
      nodePort: 32000 # External traffic is forwarded from this port to the service port

```

## Apply files

### start-app.sh

#### Execute

```shell
bash startapp.sh
```

```bash
#! /bin/bash
function pause() {
  read -s -n 1 -p "Press any key to start port forwarding . . ."
  echo ""
}
kubectl apply -f webapp-deployment.yml
kubectl apply -f webapp-service.yml
kubectl apply -f mongo-deployment.yml
kubectl apply -f mongo-service.yml
kubectl apply -f mongo-pvc.yml

pause
kubectl port-forward svc/webapp-service 3000:3000 --address 0.0.0.0 &
```

#### Stop

```shell
bash stopapp.sh
```

```bash
#! /bin/bash
kubectl delete all --all --namespace default
kubectl delete persistentvolumechain mongo-pvc
exit 0
```
