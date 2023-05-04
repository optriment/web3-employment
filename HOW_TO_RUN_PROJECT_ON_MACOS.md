# How to run project on macOS

Here are step-by-step instructions to help beginners install and run project
locally on macOS.

## Install Homebrew, Git, and SSH keys

1. Click on the Spotlight search icon on the top right corner of your screen
   (or press CMD+Space) and type "Terminal" in the search bar. Click on Terminal
   to open it.
2. In the Terminal type the following command to install Homebrew and press
   enter:\
   `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
3. Type the following command to install Git: `brew install git`. Press enter
   and wait for the installation to complete.
4. Check for SSH keys: type the following command in the Terminal: `ls ~/.ssh`.
   If you see a message like "No such file or directory", it means that you
   don't have SSH keys yet and you have to generate the keys. Follow the next
   step.
5. Generate a SSH key: If you already have an SSH key, you can skip this step.
   In the Terminal window, type the following command and press enter:
   `ssh-keygen -t rsa -b 4096 -C "your_email@example.com"`. Follow the prompts
   to generate a new SSH key. We recommend to use default settings (just press
   enter on prompts).

## Install Docker Desktop

1. Open your preferred web browser and go to the
   [Docker website](https://www.docker.com/products/docker-desktop).
2. Click on the "Download for Mac" button to download the Docker Desktop
   installer for macOS.
3. Once the download is complete, double-click on the downloaded file
   (Docker.dmg) to open the installer. Follow the prompts to install Docker
   Desktop on your Mac.
4. After the installation is complete, open Docker Desktop from your
   Applications folder or Launchpad. You may be prompted to enter your system
   password to allow Docker to make changes to your system.

## Install & Run Project

1. Create a directory where project will be installed. In the Terminal type the
   following command: `mkdir -p ~/Projects/optriment` and press enter.
2. Clone the repository: In the Terminal window, navigate to the directory where
   you want to store the project by typing `cd ~/Projects/optriment` and pressing
   enter. Then, type the following command and press enter:
   `git clone https://github.com/optriment/web3-employment.git`. This will
   create a new directory called "web3-employment" in the "optriment" folder.
3. Navigate to the project directory: In the Terminal window, type the following
   command and press enter: `cd web3-employment`
4. Copy configuration file: In the Terminal window, type the following command
   and press enter: `cp .env.example .env`
5. Update the database configuration: In the Terminal window, type the following
   command and press enter: `nano .env`. This will open the Nano text editor.
   Use the arrow keys to navigate to the line that starts with `DATABASE_URL=`
   and update it with the following value:
   `DATABASE_URL=postgresql://app:password@db:5432/app?sslmode=disable`.
   Press `CTRL+X` to exit Nano, then press `Y` to save the changes and press
   enter to confirm the filename.
6. Build Docker image: In the Terminal window, type the following command and
   press enter: `make prod-docker-build`. This will build the Docker image
   required for the project.
7. Start Docker container: In the Terminal window, type the following command
   and press enter: `make prod-docker-start`. This will start the Docker
   container for the project. Please wait 1-2 minutes.
8. Apply database migrations: In the Terminal window, type the following command
   and press enter: `make prod-docker-db-migrate`. This will apply any necessary
   database migrations to the Docker container.
9. Open the project in your browser: In your preferred browser (e.g. Chrome,
   Brave), type the following URL in the address bar:
   [http://localhost:3001](http://localhost:3001). This will open the project
   in your browser.

That's it! You should now be able to run the project locally on your laptop.
