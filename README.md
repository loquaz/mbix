I made this cli utility to my own needs because
frequentily I install in my computer more than one linux distribution and need a way to  verify other partitions when logeed on one of my distributions.
The tool mounts the unmounted partitions in temporary directories under /tmp/mbx/<partition name> and links the mbx directory under $HOME/mbx. Doing this I can visualize my other partitions.
to acomplish that, type on terminal "$> mbx mount" and to visualize what was mounted type "$> mbx show"