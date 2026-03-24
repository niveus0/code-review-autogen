import os
from dotenv import load_dotenv
load_dotenv()
llms_config = {
    'api_key': os.getenv("API_KEY"),
    'base_url': os.getenv("BASE_URL"),
    'model':'stepfun/step-3.5-flash:free'

}