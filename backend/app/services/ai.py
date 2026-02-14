import google.generativeai as genai

class AIService:
    @staticmethod
    async def suggest_reply(message: str, context: str = ""):
        """Generate smart reply suggestions"""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Customer message: {message}
        Context: {context}
        
        Generate a professional, helpful reply suggestion:
        """
        
        response = model.generate_content(prompt)
        return response.text