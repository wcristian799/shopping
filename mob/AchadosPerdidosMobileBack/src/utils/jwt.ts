import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET!
const DURATION = 60 * 60 * 24

// função para gerar o token
export function createJWT(data:object){
    const payload = { ...data,
        iat: Math.floor(Date.now() / 1000)
     }
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: DURATION,
        algorithm: "HS256"
    })
}

export function verifyJWT(token:string){
    return jwt.verify(token, JWT_SECRET, function(err:any, decoded){
        if (err){
            return undefined
        }
        return decoded
        
    })
}
