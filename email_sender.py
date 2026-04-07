#!/usr/bin/env python3
"""
Email Sending Service for GradeWise Pro
Handles actual email sending functionality
"""

import json
import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os

def send_email(smtp_server, smtp_port, username, password, from_email, to_email, subject, body, attachments=None):
    """Send an email using SMTP"""
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body
        msg.attach(MIMEText(body, 'plain'))
        
        # Add attachments if provided
        if attachments:
            for file_path in attachments:
                if os.path.exists(file_path):
                    with open(file_path, "rb") as attachment:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(attachment.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename= {os.path.basename(file_path)}'
                        )
                        msg.attach(part)
        
        # Connect to SMTP server and send
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Secure connection
        server.login(username, password)
        text = msg.as_string()
        server.sendmail(from_email, to_email, text)
        server.quit()
        
        return {
            "success": True,
            "message": f"Email sent successfully to {to_email}"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def send_gmail(app_password, from_email, to_email, subject, body, attachments=None):
    """Send email using Gmail SMTP"""
    
    return send_email(
        smtp_server="smtp.gmail.com",
        smtp_port=587,
        username=from_email,
        password=app_password,
        from_email=from_email,
        to_email=to_email,
        subject=subject,
        body=body,
        attachments=attachments
    )

def send_outlook(outlook_password, from_email, to_email, subject, body, attachments=None):
    """Send email using Outlook SMTP"""
    
    return send_email(
        smtp_server="smtp-mail.outlook.com",
        smtp_port=587,
        username=from_email,
        password=outlook_password,
        from_email=from_email,
        to_email=to_email,
        subject=subject,
        body=body,
        attachments=attachments
    )

def send_custom_smtp(config, to_email, subject, body, attachments=None):
    """Send email using custom SMTP configuration"""
    
    return send_email(
        smtp_server=config.get('smtp_server'),
        smtp_port=config.get('smtp_port', 587),
        username=config.get('username'),
        password=config.get('password'),
        from_email=config.get('from_email'),
        to_email=to_email,
        subject=subject,
        body=body,
        attachments=attachments
    )

def main():
    """Main function to handle command line arguments"""
    
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "No command provided"
        }))
        return
    
    command = sys.argv[1]
    
    try:
        if command == "send_gmail":
            # Usage: send_gmail <app_password> <from_email> <to_email> <subject> <body> [attachments...]
            if len(sys.argv) < 6:
                raise ValueError("Insufficient arguments for Gmail send")
            
            app_password = sys.argv[2]
            from_email = sys.argv[3]
            to_email = sys.argv[4]
            subject = sys.argv[5]
            body = sys.argv[6] if len(sys.argv) > 6 else ""
            attachments = sys.argv[7:] if len(sys.argv) > 7 else []
            
            result = send_gmail(app_password, from_email, to_email, subject, body, attachments)
            
        elif command == "send_outlook":
            # Usage: send_outlook <password> <from_email> <to_email> <subject> <body> [attachments...]
            if len(sys.argv) < 6:
                raise ValueError("Insufficient arguments for Outlook send")
            
            password = sys.argv[2]
            from_email = sys.argv[3]
            to_email = sys.argv[4]
            subject = sys.argv[5]
            body = sys.argv[6] if len(sys.argv) > 6 else ""
            attachments = sys.argv[7:] if len(sys.argv) > 7 else []
            
            result = send_outlook(password, from_email, to_email, subject, body, attachments)
            
        elif command == "send_custom":
            # Usage: send_custom <config_json> <to_email> <subject> <body> [attachments...]
            if len(sys.argv) < 5:
                raise ValueError("Insufficient arguments for custom SMTP send")
            
            config = json.loads(sys.argv[2])
            to_email = sys.argv[3]
            subject = sys.argv[4]
            body = sys.argv[5] if len(sys.argv) > 5 else ""
            attachments = sys.argv[6:] if len(sys.argv) > 6 else []
            
            result = send_custom_smtp(config, to_email, subject, body, attachments)
            
        else:
            result = {
                "success": False,
                "error": f"Unknown command: {command}"
            }
            
    except Exception as e:
        result = {
            "success": False,
            "error": str(e)
        }
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
