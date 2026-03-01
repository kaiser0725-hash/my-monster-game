import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # 这里的 port 获取是 Render 部署成功的关键
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)