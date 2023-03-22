# FIUBOOK Core

**FIUBOOK** is a university booking system that allows service offerers to publish their services (such as _books_, _classrooms_, _projectors_, etc.) and requestors to book those services. Services bookings can be automatically confirmed or manually confirmed by the service owner, and they can be flagged as returnable (if they are physical objects, such as projectors) or not. It is a role-based system, so services can be configured to be booked by a subset of useres that have certain roles.

It also provides an Administrator console that enables management of services, bookings, users, and displays system usage metrics.

Developed on assignment "(75.61) Programming Workshop III" - Faculty of Engineering, Buenos Aires University

| **Student**               | **Student ID** | **Github User**                            |
| ------------------------- | -------------- | ------------------------------------------ |
| Aguerre, Nicolás Federico | 102145         | [@nicomatex](https://github.com/nicomatex) |
| Klein, Santiago           | 102192         | [@sankle](https://github.com/sankle)       |

-   Frontend repository: https://github.com/sankle/fiubook_webapp

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
       `minikube start`
       BEWARE: Starting minikube configures `kubectl` to point to the local cluster.

2. Run `make bootstrap_cluster`

3. To access the cluster from the host machine (i.e. all the time), you should open a terminal and run `minikube tunnel`, and do not close it.

4. Run `kubectl get all` and use the external-ip of `service/postgres-db-external` and port 5432 to connect to the postgres instance using PGadmin.

5. Create a new database called `fiubook-core-db` and run the script located in `database/table_schemas.sql` in this repo.

# Admin user creation

1. Login with an unregistered user on the frontend

2. Using PGAdmin, go to the Users table and set the `is_admin` column for the user created in the first step to `true`.

3. Log out and then log in again with the user. You should now see the `Administración` button on the top left corner.

[Link to design document](https://docs.google.com/document/d/1E47VkvhY0L77N5DmNpXWNVSmEmn4XE_PP-RnZ7xKpCM/edit)
