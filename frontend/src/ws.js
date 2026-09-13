import {io} from 'socket.io-client'

export function connectWs(){
return io('nexa-production-0650.up.railway.app')
}

