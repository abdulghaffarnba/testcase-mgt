# 🌟 Test Case Management App Setup Guide 🌟

## 📝 Description

This project is a simple testcase management application that allows users to interact with a database through a Flask-based backend. The system involves setting up a virtual environment, installing dependencies, configuring environment variables, setting up the database, and running the app locally.

## 📚 Resources
- [Postman Collection for API Testing](https://github.com/abdulghaffarnba/testcase-mgt/tree/main/Postman_collection)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Slack API for pushing notifications for bot channel](https://api.slack.com/tutorials/tracks/posting-messages-with-curl)

## 🛠️ Technologies and Tools Used
- **Flask**: Web framework used for the backend.
- **PostgreSQL**: Relational database management system.
- **Slack Webhooks**: For sending notifications to Slack channels.

## 🚀 Installation et Configuration

Follow these steps to set up and run the project locally:

1. **Create a Virtual Environment**:
   Open your terminal or command prompt and create a virtual environment using the following command:
   ```
   python -m venv testMgtVenv
   ```
2. **Activate the Virtual Environment:**:
    ```
    testMgtVenv\Scripts\activate
    ```
3. **Install the Required Dependencies:**:
    ```
    pip install -r requirements.txt
    ```
4. **Create the ```.env``` File**:
Create a .env file in the root directory of the project and add the following configuration
    ```
    # DB Configs
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=db_interview_abdul_ghaffar
    DB_USER=postgres
    DB_PASSWORD=postgres
    
    # Slack Webhook
    SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    
    # App port
    APP_PORT=21001
    ```
5. **Set Up the Database**:
    * Create a new database using PostgreSQL (*Note*: Replace ```abdul_ghaffar``` to your database):
    ```
    psql -U postgres -c "CREATE DATABASE db_interview_abdul_ghaffar;"
    ```
    * Execute the SQL file to populate the database:
    ```
    psql -U postgres -f dummy_db.sql
    ```
6. **Run the Flask Application**:
Start the Flask app using the following command:
    ```
    python app.py
    ```
7. **Web Interaction**:
    * Navigate to the `web/templates` folder and open the `dashboard.html` file to interact with the web browser.

## 📝 Conclusion

This **Test case Management App** is a powerful and user-friendly solution designed to streamline the process of managing and executing test cases. By utilizing a Flask backend and PostgreSQL database, the application offers an efficient way to store and retrieve test data, while also integrating seamlessly with Slack for notifications. With an intuitive frontend powered by HTML templates, users can easily interact with the system to monitor the status of their test cases and receive timely alerts.

Thank you for using this app! 😊
