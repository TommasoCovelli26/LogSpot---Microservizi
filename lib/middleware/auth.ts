/**
 * Estrae il token Authorization.
 */
export function getAuthorizationHeader(
    token: string
){

    return {

        Authorization: `Bearer ${token}`

    };

}