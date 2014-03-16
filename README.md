##HarborJS

This project aims to provide a full web interface for dokku in order to manage apps, databases and even user account

##Install
`npm update`

Create a `credentials.json` file in the root directory to connect to your dokku installation:

```
{
  "user": "dokku_username",
  "host": "dokku_ip_address",
  "password": "my_password"
  
}
```

The `user` field probably has the value `root` to execute all sorts of commands.


####TO DO

- Add specific view for each container
- Add Database ( Rethink DB or Redis ) for user account
- Ability to send command to a specific container
- Add tty.js for docker to project
- Fix MySQL and Redis Plugin for dokku
