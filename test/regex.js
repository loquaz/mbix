var assert = require('chai').assert;
var expect = require('chai').expect;

var _partPattern = /^\/dev\/[a-z]{1,3}[0-9]{1,2}$/;
var _mountPointRegex = /^(\/dev\/[a-z]{1,3}[0-9]{1,2})(\s+)(on)(\s+)(\/(.*)?)(\s+)(type)(\s+)([a-zA-Z0-9]+)(\s+)(.*)$/
var _mountPointStr = '/dev/sdb9 on / type ext4 (rw,noatime,errors=remount-ro)';
var _mountPointStr1 = '/dev/sdb10 on /boot/efi type vfat '; 
_mountPointStr1 += '(rw,relatime,fmask=0077,dmask=0077,codepage=437,iocharset=iso8859-1,shortname=mixed,errors=remount-ro)';
var _mountPointStr2 = "/dev/sdc1 on /media/sereno/elementary OS 5.0 Juno type iso9660 "
_mountPointStr2 += "(ro,nosuid,nodev,relatime,nojoliet,check=s,map=n,blocksize=2048,uid=1000,gid=1000,dmode=500,fmode=400,uhelper=udisks2)"

describe('Regex', ()=>{
    describe('Nome de Partições', ()=>{
        it('deve retornar verdadeiro para o valor /dev/sda1', ()=>{
            expect('/dev/sda1').to.match(_partPattern);
        });
        it('deve retornar verdadeiro para o valor /dev/sda10', ()=>{
            expect('/dev/sda10').to.match(_partPattern);
        });
        it('deve falhar para o valor /dev/sda', ()=>{
            expect('/dev/sda').to.not.match(_partPattern);
        });
    })
    /**
     * Groups:
     * 1 = device
     * 2 = blank space
     * 3 = on (word)
     * 4 = blank space
     * 5 = mounting point
     * 6 = mounting point withou slash
     * 7 = blank space
     * 8 = type (word)
     * 9 = blank space
     * 10 = type
     */
    var _mountPointMatchs = _mountPointRegex.exec(_mountPointStr);
    var _mountPointMatchs1 = _mountPointRegex.exec(_mountPointStr1);
    var _mountPointMatchs2 = _mountPointRegex.exec(_mountPointStr2);
    

    //console.log(_mountPointMatchs2);    

    describe('Mountpoints', ()=>{
        it(`deve retornar verdadeiro para o valor ${_mountPointStr}`, ()=>{
            expect(`${_mountPointStr}`).to.match(_mountPointRegex);
        });
       
        it(`deve retornar ext4`, ()=>{
            expect(_mountPointMatchs[10]).to.equal('ext4');
        });
        
        it(`deve retornar vfat como fileSystem em ${_mountPointStr1}`, ()=>{
         expect(_mountPointMatchs1[10]).to.equal('vfat');
        });

        it(`deve retornar iso9660 como fileSystem em ${_mountPointStr2}`, ()=>{
            expect(_mountPointMatchs2[10]).to.equal('iso9660');
         });
       
    })
})