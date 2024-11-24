import { db } from "../db"
import { usersTable } from "../db/schema"
import { eq } from "drizzle-orm"

export async function getUsers(){
    try{
        return await db.select().from(usersTable)
    }
    catch(e:unknown){
        console.log(`Error getting users:${e}`)
    }
}
export async function getUserBuId(id: number){
    try{
        const user = await db.select().from(usersTable).where(eq(usersTable.id, id))
        return user
    }
    catch(e:unknown){
        console.log(`Error getting user:${e}`)
    }
}
    
