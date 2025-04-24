from flask import Flask, jsonify, request, render_template, redirect, url_for, send_file, Response
from flask_cors import CORS
from faker import Faker
import random
import os
import pandas as pd
import io
from datetime import datetime
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  

# Initialize Faker
fake = Faker()

# Common Israeli first names
israeli_first_names = [
    # Hebrew names
    "Moshe", "David", "Yosef", "Avraham", "Yaakov", "Yitzhak", "Noam", "Omer", "Eitan", "Amit",
    "Yonatan", "Ariel", "Avi", "Tal", "Amir", "Gal", "Idan", "Itay", "Nir", "Roi", "Lior",
    "Sara", "Rachel", "Leah", "Rivka", "Miriam", "Tamar", "Noa", "Yael", "Shira", "Maya",
    "Michal", "Ayelet", "Talia", "Avigail", "Hila", "Gili", "Roni", "Adi", "Lihi", "Shani",
    # Arabic names
    "Mohammed", "Ahmad", "Ali", "Omar", "Ibrahim", "Yusuf", "Mahmoud", "Hassan", "Hussein",
    "Fatima", "Aisha", "Mariam", "Layla", "Zainab", "Nour", "Amira", "Rania", "Huda", "Samira",
    # Russian-Israeli names
    "Alex", "Mikhail", "Boris", "Vladimir", "Dmitri", "Sergei", "Natalia", "Olga", "Irina", "Tatiana"

]

# Common Israeli last names
israeli_last_names = [
    # Hebrew last names
    "Cohen", "Levi", "Mizrahi", "Peretz", "Biton", "Dahan", "Avraham", "Friedman", "Azoulay", "Amar",
    "Malka", "Gabay", "Ohayon", "Katz", "Shapiro", "Goldstein", "Rosenberg", "Weiss", "Hoffman",
    "Levy", "Ben-David", "Ben-Ami", "Israeli", "Golan", "Sharon", "Shalom", "Levin", "Berkowitz",
    # Arabic last names
    "Mansour", "Haddad", "Khoury", "Daoud", "Saleh", "Abbas", "Zidane", "Bishara", "Jabarin", "Zoabi",
    # Russian-Israeli last names
    "Ivanov", "Petrov", "Sokolov", "Smirnov", "Kuznetsov", "Popov", "Lebedev", "Novikov"
]


# Common Israeli email domains
israeli_email_domains = ["gmail.com", "walla.co.il", "hotmail.com",]

# Common Israeli cities
israeli_cities = [
    "Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", 
    "Ashdod", "Netanya", "Beer Sheva", "Holon", "Bnei Brak",
    "Ramat Gan", "Rehovot", "Herzliya", "Kfar Saba", "Ra'anana",
    "Nazareth", "Eilat", "Tiberias", "Acre", "Nahariya",
    "Lod", "Ramla", "Ashkelon", "Bat Yam", "Beit Shemesh"
]


def validate_israeli_id(id_number):
    """
    Validate an Israeli ID number using the check digit algorithm.
    Israeli IDs are 9 digits, where the last digit is a check digit.
    """
    # Check if ID is exactly 9 digits
    if not re.match(r'^\d{9}$', id_number):
        return False
    
    # The algorithm to validate Israeli IDs:
    # 1. Multiply each of the first 8 digits by 1 or 2 alternately
    # 2. If the result of multiplication is greater than 9, subtract 9
    # 3. Sum all the results
    # 4. The check digit is the number that when added to the sum makes it divisible by 10
    
    # Convert to list of integers
    digits = [int(digit) for digit in id_number]
    
    # Calculate the sum according to the algorithm
    multipliers = [1, 2, 1, 2, 1, 2, 1, 2]
    checksum = 0
    
    for i in range(8):
        product = digits[i] * multipliers[i]
        if product > 9:
            product -= 9
        checksum += product
    
    # Calculate the check digit
    check_digit = (10 - (checksum % 10)) % 10
    
    # Verify the check digit
    return check_digit == digits[8]

def generate_valid_israeli_id():
    """Generate a valid Israeli ID number that passes the check digit validation"""
    while True:
        # Generate first 8 digits
        first_8_digits = ''.join([str(random.randint(0, 9)) for _ in range(8)])
        
        # Convert to list of integers
        digits = [int(digit) for digit in first_8_digits]
        
        # Calculate the sum according to the algorithm
        multipliers = [1, 2, 1, 2, 1, 2, 1, 2]
        checksum = 0
        
        for i in range(8):
            product = digits[i] * multipliers[i]
            if product > 9:
                product -= 9
            checksum += product
        
        # Calculate the check digit
        check_digit = (10 - (checksum % 10)) % 10
        
        # Combine first 8 digits with the check digit
        valid_id = first_8_digits + str(check_digit)
        
        return valid_id

def validate_email(email):
    """
    Validate an email address using a regex pattern.
    Checks for basic email format and common Israeli domains.
    """
    # Basic email validation pattern
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Check if the email matches the pattern
    if not re.match(email_pattern, email):
        return False
    
    # Extract the domain from the email
    domain = email.split('@')[1]
    
    # Check if the domain is a common Israeli domain or a globally accepted domain
    common_domains = israeli_email_domains + ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
    
    # If it's a .co.il or .net.il domain, it's likely Israeli
    if domain.endswith('.co.il') or domain.endswith('.net.il') or domain.endswith('.org.il'):
        return True
    
    # If it's in our list of common domains, it's valid
    if domain in common_domains:
        return True
    
    # Otherwise, just make sure it has a valid TLD
    return domain.split('.')[-1] in ['com', 'net', 'org', 'edu', 'gov', 'mil', 'io', 'co', 'me']



def generate_israeli_person(include_first_name=True, include_last_name=True, include_email=True, include_id=True, include_gender=True, include_age=True, include_city=True):
    """Generate a random Israeli person with name and email"""
    # Generate a valid Israeli ID number
    id_number = generate_valid_israeli_id()
    
    # Generate first and last name
    first_name = random.choice(israeli_first_names)
    last_name = random.choice(israeli_last_names)
    
    # Generate email
    email = f"{first_name.lower()}.{last_name.lower()}@{random.choice(israeli_email_domains)}"
    
    # Ensure the email is valid
    while not validate_email(email):
        email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 100)}@{random.choice(israeli_email_domains)}"
    
    # Create the person data
    person = {}
    
    if include_first_name:
        person["first_name"] = first_name
    if include_last_name:
        person["last_name"] = last_name
    if include_email:
        person["email"] = email
        person["email_valid"] = True  # Always true since we validate it above
    if include_id:
        person["id"] = id_number
        person["id_valid"] = validate_israeli_id(id_number)  # Should always be true since we generate valid IDs
    
    # Always add full_name if either first or last name is included
    if include_first_name or include_last_name:
        if include_first_name and include_last_name:
            person["full_name"] = f"{first_name} {last_name}"
        elif include_first_name:
            person["full_name"] = first_name
        else:
            person["full_name"] = last_name
    
    # Add optional fields based on parameters
    if include_gender:
        person["gender"] = random.choice(["male", "female"])
    
    if include_city:
        person["city"] = random.choice(israeli_cities)
    

    if include_age:
        person["age"] = random.randint(18, 90)
    
    return person

def create_excel_file(people):
    """Create an Excel file from the list of people"""
    # Convert the list of dictionaries to a DataFrame
    df = pd.DataFrame(people)
    
    # Define the columns we want to include in the Excel file
    columns_to_include = []
    
    # Check which columns exist in the data and add them to our list
    if 'id' in df.columns:
        columns_to_include.append('id')
    if 'first_name' in df.columns:
        columns_to_include.append('first_name')
    if 'last_name' in df.columns:
        columns_to_include.append('last_name')
    if 'full_name' in df.columns:
        columns_to_include.append('full_name')
    if 'email' in df.columns:
        columns_to_include.append('email')
    if 'gender' in df.columns:
        columns_to_include.append('gender')
    if 'age' in df.columns:
        columns_to_include.append('age')
    if 'city' in df.columns:
        columns_to_include.append('city')

    
    # If no columns were found, return an empty DataFrame
    if not columns_to_include:
        df = pd.DataFrame()
    else:
        # Select only the columns that exist in the data
        df = df[columns_to_include]
    
    # Create column name mappings
    column_mappings = {
        'id': 'ID',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'full_name': 'Full Name',
        'email': 'Email',
        'gender': 'Gender',
        'age': 'Age',
        'city': 'City',
    }
    
    # Rename only the columns that exist
    rename_dict = {col: column_mappings[col] for col in df.columns if col in column_mappings}
    df = df.rename(columns=rename_dict)
    
    # Create a buffer to store the Excel file
    output = io.BytesIO()
    
    # Create Excel writer
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Israeli Profiles')
        
        # Auto-adjust columns' width
        worksheet = writer.sheets['Israeli Profiles']
        for idx, col in enumerate(df.columns):
            column_width = max(df[col].astype(str).map(len).max(), len(col)) + 2
            worksheet.column_dimensions[chr(65 + idx)].width = column_width
    
    # Seek to the beginning of the buffer
    output.seek(0)
    
    return output

@app.route('/', methods=['GET', 'POST'])
def index():
    """Main page that handles form submission and displays results"""
    count = 10  # Default number of people to generate
    people = []
    
    if request.method == 'POST':
        try:
            count = int(request.form.get('count', 10))
            # Limit the maximum number to 10000
            if count > 10000:
                count = 10000
            elif count < 1:
                count = 1
        except ValueError:
            count = 10
            
        # Generate the requested number of people
        people = [generate_israeli_person() for _ in range(count)]
        
        # Check if the user wants to download as Excel
        if 'download_excel' in request.form:
            # Create Excel file
            excel_file = create_excel_file(people)
            
            # Generate a timestamp for the filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Return the Excel file as a downloadable attachment
            return send_file(
                excel_file,
                as_attachment=True,
                download_name=f"israeli_profiles_{timestamp}.xlsx",
                mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
    
    return render_template('index.html', people=people, count=count)

@app.route('/download-excel', methods=['POST'])
def download_excel():
    """Endpoint to download the generated data as Excel"""
    try:
        # Get data from request
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Check if data contains 'people' key
        if 'people' in data and isinstance(data['people'], list):
            people = data['people']
        else:
            # If data is already a list, use it directly
            people = data if isinstance(data, list) else [data]
        
        if not people:
            return jsonify({"error": "No people data provided"}), 400
        
        # Create Excel file
        excel_file = create_excel_file(people)
        
        # Set filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"israeli_profiles_{timestamp}.xlsx"
        
        # Return the Excel file
        return send_file(
            excel_file,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"Error in download_excel: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-israeli-person', methods=['GET'])
def api_generate_israeli_person():
    """API endpoint to generate a random Israeli person"""
    count = request.args.get('count', default=1, type=int)
    
    # Get checkbox parameters for basic info
    include_first_name = request.args.get('includeFirstName', default='true', type=str).lower() == 'true'
    include_last_name = request.args.get('includeLastName', default='true', type=str).lower() == 'true'
    include_email = request.args.get('includeEmail', default='true', type=str).lower() == 'true'
    include_id = request.args.get('includeId', default='true', type=str).lower() == 'true'
    
    # Get checkbox parameters for additional info
    include_gender = request.args.get('includeGender', default='true', type=str).lower() == 'true'
    
    # Legacy parameters (set to False as they've been removed from the UI)
    include_age = request.args.get('includeAge', default='false', type=str).lower() == 'true'
    include_city = request.args.get('includeCity', default='false', type=str).lower() == 'true'
    
    if count > 10000:
        count = 10000
    
    if count == 1:
        return jsonify(generate_israeli_person(
            include_first_name=include_first_name,
            include_last_name=include_last_name,
            include_email=include_email,
            include_id=include_id,
            include_gender=include_gender,
            include_age=include_age,
            include_city=include_city
        ))
    else:
        persons = [
            generate_israeli_person(
                include_first_name=include_first_name,
                include_last_name=include_last_name,
                include_email=include_email,
                include_id=include_id,
                include_gender=include_gender,
                include_age=include_age,
                include_city=include_city
            ) for _ in range(count)
        ]
        return jsonify(persons)

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
