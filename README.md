# MicroK8s Cluster Setup

1. Install all necessary KVM packages 
    1. For Ubuntu 22.04, [follow these steps](https://linuxhint.com/install-kvm-ubuntu-22-04/)
2. Setup cluster following [this guide](https://ubuntu.com/tutorials/getting-started-with-kubernetes-ha?&_ga=2.90705683.844403139.1667873870-1810360588.1667873870#1-overview)
    1. On the first VM, run `microk8s add-node`
    2. On the second VM, join as worker 
3. [Install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)
4. In the first VM (the one that is a control plane node), run `$microk8s config`, copy the output, and paste it into `~/.kube/config` to use `kubectl` from the host machine. 
5. Profit! 

