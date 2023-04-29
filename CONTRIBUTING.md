# Contributing

The development branch is `main`.\
This is the default branch that all Pull Requests (PR) should be made against.

Requirements:

- [Node.js](https://nodejs.org/en/) version 17
- [Docker](https://www.docker.com/products/docker-desktop/) version 20

## Fork and set up project

Please follow instructions below to install project.

1. [Fork](https://help.github.com/articles/fork-a-repo/)
   this repository to your own GitHub account

2. [Clone](https://help.github.com/articles/cloning-a-repository/)
   it to your local device

3. Create a new branch:

   ```sh
   git checkout -b YOUR_BRANCH_NAME
   ```

4. Install the dependencies with:

   ```sh
   make setup
   ```

5. Copy the environment variables:

   ```sh
   cp .env.example .env
   ```

   Set up your settings in `.env` file.

## Start the project

1. Run the database in the first terminal session:

   ```sh
   make db-start
   ```

2. Open another terminal session

3. Apply the database migrations:

   ```sh
   make db-migrate
   ```

4. Populate the development database with predefined data:

   ```sh
   make db-seed
   ```

5. Run the web server:

   ```sh
   make run
   ```

The last command will start the web server on
[http://localhost:3000/](http://localhost:3000/).

## Linting

To check the formatting of your code:

```sh
make lint
```

If you get errors, you can fix them with:

```sh
make fix
```

## Testing

1. Run the test database in the first terminal session:

   ```sh
   make test-db-start
   ```

2. Run the tests suite in the second terminal session:

   ```sh
   make test
   ```
