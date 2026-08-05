import os, httpx, asyncio, base64
from dotenv import load_dotenv
load_dotenv()
key = os.getenv('NVIDIA_API_KEY')

async def main():
    try:
        # A simple 1x1 transparent GIF
        b64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        
        payload = {
            'model': 'meta/llama-3.2-90b-vision-instruct',
            'messages': [
                {
                    'role': 'user',
                    'content': f'What is in this image? <img src="data:image/gif;base64,{b64}" />'
                }
            ],
            'max_tokens': 100
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post('https://integrate.api.nvidia.com/v1/chat/completions', headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}, json=payload)
            print(res.status_code, res.text)
    except Exception as e:
        print("Error:", e)

asyncio.run(main())
