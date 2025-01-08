from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_cors import CORS
import os
import requests
from message import *
from http_status_codes import *

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Environment variables
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_name = os.getenv('DB_NAME')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL')
app_port = os.getenv('APP_PORT')

# DB Configs
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
db = SQLAlchemy(app)

# DB Models
class Module(db.Model):
    __tablename__ = 'tbl_modules'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class Testcase(db.Model):
    __tablename__ = 'tbl_testcases'
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('tbl_modules.id'), nullable=False)
    testcase_id = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False)

# Slack Notification -> Channel: test-case-notifications
def send_slack_notification(message):
    response = requests.post(slack_webhook_url, json=message)
    if response.status_code != HTTP_OK:
        print(f"Failed to send notification to Slack: {response.status_code}, {response.text}")

@app.route('/')
def home():
    return "Hello, Flask!"

# Get Modules
@app.route('/modules', methods=['GET'])
def get_modules():
    modules = Module.query.all()
    module_list = []

    for module in modules:
        testcase_count = Testcase.query.filter_by(module_id=module.id).count()
        module_list.append({"id": module.id, "name": module.name, "testcase_count": testcase_count})
    
    return jsonify(module_list), HTTP_OK

# Add Module
@app.route('/modules', methods=['POST'])
def add_module():
    new_module = request.get_json()
    if "name" not in new_module:
        return jsonify(MODULE_NAME_REQUIRED), HTTP_BAD_REQUEST
    module_name = new_module["name"].lower()
    if Module.query.filter_by(name=module_name).first():
        return jsonify(MODULE_ALREADY_EXISTS), HTTP_BAD_REQUEST
    module = Module(name=module_name)
    db.session.add(module)
    db.session.commit()
    return jsonify(MODULE_ADDED_SUCCESSFULLY), HTTP_CREATED

# Update Module
@app.route('/modules/<module_name>', methods=['PUT'])
def update_module(module_name):
    module = Module.query.filter_by(name=module_name.lower()).first()
    if module is None:
        return jsonify(MODULE_NOT_FOUND), HTTP_NOT_FOUND

    updated_data = request.get_json()
    if "name" in updated_data:
        new_name = updated_data["name"].lower()
        if Module.query.filter_by(name=new_name).first():
            return jsonify(MODULE_ALREADY_EXISTS), HTTP_BAD_REQUEST
        module.name = new_name
        db.session.commit()
        return jsonify(MODULE_UPDATED_SUCCESSFULLY), HTTP_OK
    else:
        return jsonify(MODULE_NAME_REQUIRED), HTTP_BAD_REQUEST
    
# Delete Module
@app.route('/modules/<module_name>', methods=['DELETE'])
def delete_module(module_name):
    module = Module.query.filter_by(name=module_name.lower()).first()
    if module is None:
        return jsonify(MODULE_NOT_FOUND), HTTP_NOT_FOUND

    # Check if it's utilized in Testcase
    if Testcase.query.filter_by(module_id=module.id).count() > 0:
        return jsonify(CANNOT_DELETE_MODULE), HTTP_BAD_REQUEST

    db.session.delete(module)
    db.session.commit()
    return jsonify(MODULE_DELETED_SUCCESSFULLY), HTTP_OK

# Get Test case
@app.route('/modules/<module_name>', methods=['GET'])
def get_testcases(module_name):
    module = Module.query.filter_by(name=module_name.lower()).first()
    if module is None:
        return jsonify(MODULE_NOT_FOUND), HTTP_NOT_FOUND
    testcases = Testcase.query.filter_by(module_id=module.id).all()
    testcase_list = [{"testcase_id": testcase.testcase_id, "description": testcase.description, "status": testcase.status} for testcase in testcases]
    return jsonify(testcase_list)

# Add test case
@app.route('/modules/<module_name>', methods=['POST'])
def add_testcase(module_name):
    module = Module.query.filter_by(name=module_name.lower()).first()

    if module is None:
        return jsonify(MODULE_NOT_FOUND), HTTP_NOT_FOUND
    new_testcase = request.get_json()

    if not all(key in new_testcase for key in ("id", "description", "status")):
        return jsonify(MISSING_REQUIRED_FIELDS), HTTP_BAD_REQUEST
    existing_testcase = Testcase.query.filter_by(testcase_id=new_testcase["id"], module_id=module.id).first()
    if existing_testcase:
        return jsonify({"error": "Testcase with ID '{}' already exists in this module.".format(new_testcase["id"])}), HTTP_BAD_REQUEST

    testcase = Testcase(testcase_id=new_testcase["id"], description=new_testcase["description"], status=new_testcase["status"], module_id=module.id)
    db.session.add(testcase)
    db.session.commit()
    # Send Slack notification
    message = {"text": f"Test Case Created: New Test Case Added: *{testcase.description}* in *{module_name.lower()}*"}
    send_slack_notification(message)
    return jsonify(TESTCASE_ADDED_SUCCESSFULLY), HTTP_CREATED

# Update test case
@app.route('/modules/<module_name>/<testcase_id>', methods=['PUT'])
def update_testcase(module_name, testcase_id):
    module = Module.query.filter_by(name=module_name.lower()).first()
    if module is None:
        return jsonify(MODULE_NOT_FOUND), HTTP_NOT_FOUND

    testcase = Testcase.query.filter_by(testcase_id=testcase_id, module_id=module.id).first()
    if testcase is None:
        return jsonify(TESTCASE_NOT_FOUND), HTTP_NOT_FOUND

    updated_testcase = request.get_json()
    testcase.description = updated_testcase.get('description', testcase.description)
    testcase.status = updated_testcase.get('status', testcase.status) 
    db.session.commit()
    # Send Slack notification
    message = {"text": f"Test Case Updated: Test Case Updated: *{testcase.description}* in *{module_name.lower()}*"}
    send_slack_notification(message)
    return jsonify(TESTCASE_UPDATED_SUCCESSFULLY), HTTP_OK

# Delete test case
@app.route('/modules/<module_name>/<testcase_id>', methods=['DELETE'])
def delete_testcase(module_name, testcase_id):
    module = Module.query.filter_by(name=module_name.lower()).first()
    if module is None:
        return jsonify(MODULE_NOT_FOUND), HTTP_NOT_FOUND

    testcase = Testcase.query.filter_by(testcase_id=testcase_id, module_id=module.id).first()
    if testcase is None:
        return jsonify(TESTCASE_NOT_FOUND), HTTP_NOT_FOUND

    db.session.delete(testcase)
    db.session.commit()
    # Send Slack notification
    message = {"text": f"Test Case Deleted: Test Case Deleted: *{testcase.description}* in *{module_name.lower()}*"}
    send_slack_notification(message)
    return jsonify(TESTCASE_DELETED_SUCCESSFULLY), HTTP_OK

if __name__ == '__main__':
    app.run(debug=True, port=app_port)