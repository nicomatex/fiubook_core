# Local Cluster Development

## Installation and bootstrapping

1. Prerequisites: Install [Minikube](https://minikube.sigs.k8s.io/docs/start/) and Kubectl

    1. [Download and install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)
    2. Download and install Minikube the binary
        ```
        curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
        sudo install minikube-linux-amd64 /usr/local/bin/minikube
        ```
    3. Start the cluster
       ` minikube start `
       BEWARE: Starting minikube configures `kubectl` to point to the local cluster.

2. Run `make bootstrap_cluster`

3. To access the cluster from the host machine, you should open a terminal and run `minikube tunnel`, and do not close it.


[Link to design document](https://docs.google.com/document/d/1E47VkvhY0L77N5DmNpXWNVSmEmn4XE_PP-RnZ7xKpCM/edit)