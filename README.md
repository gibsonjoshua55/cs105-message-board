# CS 105 Message Board
This project is a redesign by Joshua Gibson of the server side portion of the Kalamazoo College CS 105 **Lab 2: CS 105 Message Board** created by [Dr. Alyce Brady](http://www.cs.kzoo.edu/~abrady/).

With the exception of the URLs the students will interact with, the student portion of the lab is unchanged.

## Configuration
Before running the project, the a `.env` file must be configured.

First, run the following command to copy the example file:

```
cp .env.example .env
```

Next, fill out the following fields with the appropriate values for the server.

| Field           | Value          |
| :-------------- | :------------- |
| USE_DB          | If not true, then dummy data is used in on the message board and posts are saved |
| SECRET_PASSWORD | The password required to post |
| DB_HOST         | The host of the MySQL server  |
| DB_PORT         | The port of the MySQL server  |
| DB_USER         | The user to authenticate with the MySQL server |
| DB_PASSWORD     | The password to authenticate with the MySQL server |

The settings in the `.env` will be loaded by the server and used throughout the project.

## Changes required to the MySQL database

The only change required, for the simplicity of dealing with the exchange of `POST` data, is to change the `name` column of the `messages` table to `posted_by`.  This way data from the `POST` request and the MySQL query can be rendered in the same way without having to change field names.

## Running the server

Node.js must be installed on the server before running this project.  If Node is not installed, run the following commands to install the run time.

```
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Before running the server, the dependencies must be installed using the following command:

```
npm install
```

To run the server from the shell, run the command:

```
npm start
```

The server can be ran in the background as a daemon with the node module `pm2`. If pm2 is not installed on the machine, run the following command:

```
sudo npm install -g pm2
```

Once pm2 is installed, run the following command from the root directory of the project to run the server in the background.

```
pm2 start cs105MessageBoardServer.js
```

To stop the server, run the following command:

```
pm2 stop cs105MessageBoardServer
```

## Apache Configuration for CS Server

To access the project from the web behind an apache server, a reverse proxy must be created.

Before configuring the proxy, the some Apache modules must be enabled by using the following commands:

```
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo /etc/init.d/apache2 restart
```

Once these modules are enabled, the reverse proxy can be set up by using the following Virtual Host:

```
<VirtualHost *:80>
  ServerName cs105MessageBoard.cs.kzoo.edu
  ProxyPreserveHost On
  ProxyRequests Off
  ProxyPass / http://localhost:3000/
  ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## Pages

#### `/test-message`
This page takes a `POST` request with the following fields:
  - `salutation`
  - `posted_by`
  - `topic`
  - `shout`
  - `message`
  - `color`
  - `password`

The page will render the raw values that are in the fields of the `POST`'s body as well as a rendered version of how the message will appear on the message board.

The `password` field is hidden with a `*` character for every character in the password, but is not checked to see if it matches the expected password

#### `/post-message`
This page takes a `POST` request with the following fields:
  - `salutation`
  - `posted_by`
  - `topic`
  - `shout`
  - `message`
  - `color`
  - `password`

The `POST` data is then sent to the database so it can be rendered on the message board.

The data will only be `INSERT`ed into the database if the password in the `POST` request matches the `SECRET_PASSWORD` in the `.env` file.

If the password is correct, the message that will be displayed on the message board is rendered in the browser. If it is not correct, an error message with the raw fields are displayed in the same way they are in `test-message`.

#### `/cs105MessageBoard`
This page renders all of the messages in the database.  They are rendered in a responsive grid that adjusts the number of messages per row based on the display size.

## Technologies used

| Technology | Use     |
| :------------- | :------------- |
| [Node.js](https://nodejs.org/en/) | Javascript run time used to run server-side code |
| [express](https://expressjs.com/) | Server used to define routes and handle requests       |
| [pug](https://pugjs.org/api/getting-started.html) | Used to render HTML based on defined templates |
| [Bootstrap](https://getbootstrap.com/) | Used to style the web app |
| [mysql](https://www.npmjs.com/package/mysql) | Used to interact with mysql server |
