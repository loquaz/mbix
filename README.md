# **mbix |  Multi Boot *nix**

I made this cli utility to my own needs. Frequentily, I install in my computer more than one **linux distribution** and need a way to  explore other partitions when logeed on one of them.
The tool mounts the unmounted partitions in temporary directories under 
```bash
$>/tmp/mbx/partition_ name
``` 
and links the mbx directory under $HOME/mbx. Doing this, I can visualize my other partitions.
to acomplish that, type on terminal 
```bash
$> mbx mount
```
and to visualize what was mounted type:
```bash
$> mbx show
```


