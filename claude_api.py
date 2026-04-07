#!/usr/bin/env python3
"""
Claude API Integration for GradeWise Pro
Handles AI-powered email and message generation
"""

import json
import sys
from anthropic import Anthropic

def generate_email(api_key, student_name, student_class, average, term, tone="formal"):
    """Generate an email for a parent using Claude."""
    
    client = Anthropic(api_key=api_key)
    
    tone_descriptions = {
        "formal": "formal and professional",
        "warm": "warm, encouraging and friendly",
        "brief": "very brief and concise",
        "concern": "concerned but constructive - the student needs improvement"
    }
    
    tone_desc = tone_descriptions.get(tone, "formal and professional")
    
    prompt = f"""Write a {tone_desc} email from a class teacher to a parent/guardian about the {term} report card for {student_name}. 
The student has an overall average of {average}% in {student_class}. 
Write 2-3 short paragraphs only. Start with "Dear Parent/Guardian," and end with a professional closing.
Sign off as "The Class Teacher"."""
    
    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            "success": True,
            "content": message.content[0].text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def generate_whatsapp_message(api_key, student_name, student_class, average, term):
    """Generate a WhatsApp message for sharing report."""
    
    client = Anthropic(api_key=api_key)
    
    prompt = f"""Create a brief, friendly WhatsApp message from a teacher to a parent about their child's report card.
Student: {student_name}
Class: {student_class}
Average: {average}%
Term: {term}

The message should be:
- Short and conversational (2-3 sentences max)
- Encouraging and positive
- Include mention of attaching the PDF report

Write only the message, no other text."""
    
    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=300,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            "success": True,
            "content": message.content[0].text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def generate_ai_remarks(api_key, student_name, subject_performance):
    """Generate AI-powered remarks for a student."""
    
    client = Anthropic(api_key=api_key)
    
    performance_text = "\n".join([f"- {subj}: {score}%" for subj, score in subject_performance.items()])
    
    prompt = f"""Write a constructive and encouraging remark for a student named {student_name} based on their performance:

{performance_text}

The remark should:
- Be 2-3 sentences
- Be constructive and motivating
- Identify strengths and areas for improvement
- Be written in a professional but warm tone

Write only the remark, no additional text."""
    
    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=200,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            "success": True,
            "content": message.content[0].text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing command"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "generate_email" and len(sys.argv) >= 7:
        result = generate_email(
            api_key=sys.argv[2],
            student_name=sys.argv[3],
            student_class=sys.argv[4],
            average=sys.argv[5],
            term=sys.argv[6],
            tone=sys.argv[7] if len(sys.argv) > 7 else "formal"
        )
        print(json.dumps(result))
    
    elif command == "generate_whatsapp" and len(sys.argv) >= 6:
        result = generate_whatsapp_message(
            api_key=sys.argv[2],
            student_name=sys.argv[3],
            student_class=sys.argv[4],
            average=sys.argv[5],
            term=sys.argv[6] if len(sys.argv) > 6 else "Current Term"
        )
        print(json.dumps(result))
    
    elif command == "generate_remarks" and len(sys.argv) >= 4:
        subject_perf = json.loads(sys.argv[4])
        result = generate_ai_remarks(
            api_key=sys.argv[2],
            student_name=sys.argv[3],
            subject_performance=subject_perf
        )
        print(json.dumps(result))
    
    else:
        print(json.dumps({"error": "Invalid command or parameters"}))
        sys.exit(1)
