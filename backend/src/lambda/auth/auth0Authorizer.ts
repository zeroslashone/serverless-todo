import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = ''
const cert = `-----BEGIN CERTIFICATE-----
MIIDATCCAemgAwIBAgIJY14SBJBU3AJYMA0GCSqGSIb3DQEBCwUAMB4xHDAaBgNV
BAMTE3BvbDkwNS5ldS5hdXRoMC5jb20wHhcNMjAwNTIxMTAxODEzWhcNMzQwMTI4
MTAxODEzWjAeMRwwGgYDVQQDExNwb2w5MDUuZXUuYXV0aDAuY29tMIIBIjANBgkq
hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApo5v4GQrvUD4LHE7qeaaCGnopEvHkTHd
IbGnqG6d+51+17DKZ803kdP0uZ9lq2llgAOKk4wZsviNjvw7KbB1lHwLzk1rIOV7
Sqy+cK6H1fhAs+cV51Ab668+BmyJWN66fn3uoeTsJJ4B+ATR+dsG4hrqPNzhwpGf
9T+jhyEbHbc0I/MsPmVYid0FvW9AkOtKbl6pKp7HlbgSduC9NcPTQffll8wq5VYf
zAC3NhnMYOwCOHGnnTiNaWf3vL9mMGfHwRcSdZ5IHZZOgsMFVk0Y38wfuhmYJeoR
rTCEeohqV6IjpkFtmvs3/vbM5yLuHzwjzqnVZ+L8j62qFueggy7zkwIDAQABo0Iw
QDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTd98HKRt4A+qhNvuCmunE6+2eT
9jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBADqXapD6cCkh2tXA
mpq+qE7zBOEgHre3UelC6eg3JrMweV7D7MSXT2JbKQOOlbnSW5yGVHjiZPuOGske
xcyblX1ZyTRwNZRwZNKlfekuh/4CIvI3RZCHWF0OjBhrFHPwctH2THh0XXa+FtUx
p/XtD9++Qk6ls4PsjrrRWKOrGKPZzLANSLQ8rpixznX3oh+4gKjTLhWrxKw/Ed5w
knHXQaOJ/MJyMdurW3da7zYIiyi+BDxHxFr/PsGNcIiHV+EQn/0v6QyoY1zS7ZRC
rggXFMPj2kLviXOXAFDELjWSHwe5UDY7zlkgWDZfY4b386biL7A7By+d+o/f8KEa
53rPYeo=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return  verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
