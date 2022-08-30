
import { Space } from './SpaceModel' 

export class MissingFieldError extends Error {

}


export function validateSpaceEntry(arg: any) {
    if (!(arg as Space).name) {
        throw new MissingFieldError(`Value for name is required!`)
    }
    if (!(arg as Space).location) {
        throw new MissingFieldError(`Value for location is required!`)
    }
}