import openai
import os

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

def generate_llm_output(prompt, question):
    """Generate output from LLM for a given prompt and question."""
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Question: {question}\nPrompt: {prompt}"}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"
