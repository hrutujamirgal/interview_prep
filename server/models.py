from mongoengine import Document, StringField, EmailField, IntField, ReferenceField, FileField, DateTimeField
from datetime import datetime
import bcrypt




class User(Document):
    username = StringField(required=True, max_length=50)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)  
    collegeName = StringField(required=True)  

   
    def set_password(self, password):
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        self.password = hashed.decode('utf-8')

    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))




# (Interview modle)
class Interview(Document):
    userId = ReferenceField(User, required=True)
    selectedTopic = StringField(required=True, max_length=50)
    interviewDate = DateTimeField(default=datetime.utcnow)
    report = FileField(required=True) 


class MCQModel(Document):
    userId = ReferenceField(User, required=True)
    selectedTopic = StringField(required=True, max_length=50)
    date = DateTimeField(default=datetime.utcnow)
    score = IntField(min_value=0)
    report = StringField(required=True) 


# (Interview modle)
class CodingModel(Document):
    userId = ReferenceField(User, required=True)
    date = DateTimeField(default=datetime.utcnow)
    score = IntField(min_value=0)
    report = StringField(required=True) 

