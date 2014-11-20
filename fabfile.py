from fabric.api import run, env

env.user = 'root'
env.hosts = ['orbitable.me']

def start():
    run('/etc/init.d/starpeople start')

def stop():
    run('/etc/init.d/starpeople stop')

def restart():
    stop()
    start()

def branch(branch='master'):
    run("su - git -c 'cd /home/git/starpeople.git && GIT_WORK_TREE=/home/git/starpeople git checkout -f " + branch + "'")
    restart()