# HarborJS

This project aims to provide a full web interface for [dokku](https://github.com/progrium/dokku) and session management.

## Requirements

In order to run HarborJS you will need :

- Ubuntu 13 or 12.04 x64 

- Dokku and obviously Docker

- Dokku plugins (in order to use databases)

- Node.JS

- A MongoDB database 


## Installing and configuring


First clone the repository

```
git clone git@github.com:MaximeHeckel/HarborJS.git
```

Before launching the server you will need to do some setup on your machine.

1. Add your public key to ~/.ssh/authorized_key of your root and <code>sudo service ssh restart</code>

2. Fill the <code>credentials.json</code> file with your root user and host. ( nothing needs to be change here as you will run the server locally )

3. Fill the <code>./config/database.js</code> file with your MongoDB database address


Then run inside the HarborJS repository

```
npm install 

```


Launch the server with : 

```
sudo node server.js
```

## Features


HarborJS has been build to provide user sessions and web interface for managing apps and databases for dokku.

#### 0.2

- Containers have logs

- Check if app or db already exists

#### 0.1.2

- Security :  No need of root password anymore

#### 0.1.0

- Ability to create/delete apps and databases

- Link apps with databases

- Send command to a specific app

- List all your apps

- Add a ssh-key to the server

- Create/Unlink accounts

- Each apps has its own dedicated page


## How to use it


Let's deploy an app with HarborJS

- First Login or Signup. 

- Once you're logged in add your ssh-key and your computer's name into the **SSH-KEY section**.

<img src="/public/img/HarborJS.png">

- Then go to the Dashboard section and click on the **Create new app/db** 

- Type the name of your application in the App Name input
and push the register button. This action will add a new application into the database which will contain your username and the name of your app.

<img src="/public/img/HarborJS2.png">

- Now you just need to push your application on the server (just look at the [dokku](https://github.com/progrium/dokku) documentation to do so).

- Your app is deployed !

<img src="/public/img/HarborJS3.png">


If you want to create a database just click on the **Create new app/db** button, enter a new name for your database in the database section, choose which type of database you want, hit the **Create DB** button and your done.


###### Note: 
<strong>HarborJS comes with PostgreSQL, MySQL, and Redis built in. You will need to install the corresponding dokku plugins in order to make them work. In order to add your own database type you need ( at least for the moment ) to it directly into the code of the project</strong> 

## TODO:

- Config File : JSON with hostname, plugin list, etc.

- Registering new app : check if the name of the app already exists ( almost done )

- Error handling : when creating apps or databases

- Vagrantfile : For fast deployment

- Chef Recipe : That would be great

- Documentation : Doc and Tutorials, or even a wiki with step by step guides in order to explain how to deploy all sorts of apps ( with all kinds of databases )


## License

MIT
