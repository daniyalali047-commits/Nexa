//live backend connection
import {io} from 'socket.io-client'
export function connectWs(){
return io('https://nexa-production-0650.up.railway.app')
}
