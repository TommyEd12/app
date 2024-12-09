
 

export const createOTP = () :number =>{
    try{
        let otp
        return (Math.floor(1000 + Math.random() * 9000))
    } catch (error){
        throw error
    }
}