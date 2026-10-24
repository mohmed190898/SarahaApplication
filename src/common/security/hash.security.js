
import bcrypt from "bcrypt"

export const hash = async (plaintext , rounds=12 , minor ="b")=>{
    const salt = (await bcrypt.genSalt(rounds,minor)).toString();
    return bcrypt.hash(plaintext,salt);
}

export const compare = async (plaintext , cipherText)=>{
    return bcrypt.compare(plaintext,cipherText);
}
