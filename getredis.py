import redis


def gimmeyourredis():
    redlocal = redis.Redis(host='localhost', port=6379)
    rediska = redis.Redis(host='92.242.45.220', port=6379)
    tempin = rediska.get(' 562954248519682')
    redlocal.set('blazer.tin', tempin)

def main():
    while True:
        gimmeyourredis()

if __name__ == '__main__':
    main()
