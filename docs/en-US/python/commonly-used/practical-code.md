# Python 常用代码

## 基础语法

### 1 基础数据类型

#### 1.1 列表

##### 列表拼接成字符串

```python
import uuid

''.join(str(uuid.uuid4()).split('-'))
```

#### 1.2 字符串

##### 字符串截取

```python
insert = "insert into (a, b, c) values ('1', '2', '3') test"
# 起始位置不限制 从结尾反截取5个字符
insert = insert[:-5]
print(insert) # insert into (a, b, c) values ('1', '2', '3')
```

#### 1.3 字典

##### 字典随机获取值

```python
import random

# 字典值可以是方法，获取值时进行调用
def switch(arg):
    sw = {
        'fylb': random.choice(['1', '2', '3', '4']),
        'ywlx': random.choice(['1', '2']),
        'qy': random.choice(['1', 'H41030500537']),
        'jgjb': random.choice(['1', '2']),
        'wgxm': random.choice(['1', '2']),
        'ks': random.choice(['205', '210', '2752']),
        'rq': get_current_date(),
        'cjsj': get_current_date_time()
    }
    # 参数一：要传入的参数arg，参数二：默认值，当dict中没有对应的arg的键值的时候使用该默认值
    return sw.get(arg, "2")
```

##### 字典判断key存在的几种方式

```python
sw = {'test': 'cs'}

# 方式一
print('name' in sw)

# 方式二
print('name' in sw.keys())

# 方式三 (Python 2)
print sw.has_key('name')
```

#### 1.4 数值计算

```python
# 常规除
5 / 2 = 2.5
# 解释：平常除法是什么结果就是什么结果。

# 地板除
5 // 2 = 2  （5 ÷ 2 = 2.5）
5 // 3 = 1  (5 ÷ 3 = 1.6666666666666667)
# 解释：地板除，只去除完之后的整数部分。

# 取余数
5 % 2 = 1  （5 - 2*2 = 1）
4 % 2 = 0  （4 - 2*2 = 0）
7 % 3 = 1  （7 - 3*2 = 1）
13 % 5 = 3  （13 - 5*2 = 3）
```

### 2 系统模块使用

#### 2.1 time模块

```python
import time

# 获取年月日格式的字符串时间
def get_current_date():
    times = time.time()
    local_time = time.localtime(times)
    return time.strftime("%Y%m%d", local_time)


# 获取年-月-日 时:分:秒 格式的字符串时间
def get_current_date_time():
    times = time.time()
    local_time = time.localtime(times)
    return time.strftime("%Y-%m-%d %H:%M:%S", local_time)
```

#### 2.2 random

```python
import random

# 随机选择列表的某个值
random.choice(['1', '2', '3', '4'])
```

#### 2.3 线程池

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

# 创建线程总数为12的线程池
executor = ThreadPoolExecutor(12)
# 线程池提交
executor.submit({方法}, url, download_path, key)
```

### 3 语法

#### 3.1 循环

```python
for num in range(0, 5):
    print(num) # 0, 1, 2, 3, 4
```

### 4 pip命令

- 安装：`pip install 模块`

## 雪花算法

```python
import time
import logging


# 64位ID的划分
WORKER_ID_BITS = 5
DATACENTER_ID_BITS = 5
SEQUENCE_BITS = 12

# 最大取值计算
MAX_WORKER_ID = -1 ^ (-1 << WORKER_ID_BITS)  # 2**5-1 0b11111
MAX_DATACENTER_ID = -1 ^ (-1 << DATACENTER_ID_BITS)

# 移位偏移计算
WOKER_ID_SHIFT = SEQUENCE_BITS
DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS
TIMESTAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS

# 序号循环掩码
SEQUENCE_MASK = -1 ^ (-1 << SEQUENCE_BITS)

# Twitter元年时间戳
TWEPOCH = 1288834974657


logger = logging.getLogger('flask.app')


class IdWorker(object):
    """
    用于生成IDs
    """

    def __init__(self, datacenter_id, worker_id, sequence=0):
        """
        初始化
        :param datacenter_id: 数据中心（机器区域）ID
        :param worker_id: 机器ID
        :param sequence: 其实序号
        """
        # sanity check
        if worker_id > MAX_WORKER_ID or worker_id < 0:
            raise ValueError('worker_id值越界')

        if datacenter_id > MAX_DATACENTER_ID or datacenter_id < 0:
            raise ValueError('datacenter_id值越界')

        self.worker_id = worker_id
        self.datacenter_id = datacenter_id
        self.sequence = sequence

        self.last_timestamp = -1  # 上次计算的时间戳

    def _gen_timestamp(self):
        """
        生成整数时间戳
        :return:int timestamp
        """
        return int(time.time() * 1000)

    def get_id(self):
        """
        获取新ID
        :return:
        """
        timestamp = self._gen_timestamp()

        # 时钟回拨
        if timestamp < self.last_timestamp:
            logging.error('clock is moving backwards. Rejecting requests until {}'.format(self.last_timestamp))
            raise

        if timestamp == self.last_timestamp:
            self.sequence = (self.sequence + 1) & SEQUENCE_MASK
            if self.sequence == 0:
                timestamp = self._til_next_millis(self.last_timestamp)
        else:
            self.sequence = 0

        self.last_timestamp = timestamp

        new_id = ((timestamp - TWEPOCH) << TIMESTAMP_LEFT_SHIFT) | (self.datacenter_id << DATACENTER_ID_SHIFT) | \
                 (self.worker_id << WOKER_ID_SHIFT) | self.sequence
        return new_id

    def _til_next_millis(self, last_timestamp):
        """
        等到下一毫秒
        """
        timestamp = self._gen_timestamp()
        while timestamp <= last_timestamp:
            timestamp = self._gen_timestamp()
        return timestamp


if __name__ == '__main__':
    worker = IdWorker(1, 2, 0)
    print(worker.get_id())
```
