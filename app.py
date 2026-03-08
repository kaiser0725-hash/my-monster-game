import os
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
# 密钥用于维持连接稳定性
app.config['SECRET_KEY'] = 'monster_secret'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

@app.route('/')
def index():
    return render_template('index.html')

# 多人对战：处理玩家加入
@socketio.on('join')
def on_join(data):
    username = data['username']
    room = "game_room_1"
    join_room(room)
    emit('status', {'msg': f'{username} has joined the game.'}, room=room)

# 多人对战：同步位置
@socketio.on('move')
def on_move(data):
    emit('update_opponent', data, broadcast=True, include_self=False)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port)
