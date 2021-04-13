# Using Cognito User Pool to Authorize your API Gateway apis

## Preface

Cognito User Pools is:

1. Managed user directory
2. Identity provider for users to use our web/mobile app.
3. Tool for users’ management, such as email verification or password recovery.
4. Multi-factor authentication
5. Social sign in (Federated Identity) with Google, Facebook, Twitter and more.

## Integration with API Gateway

1. User logins returns JSON Web Token, NOT AWS credentials
2. Freely use with any API we build.
3. Much simpler with Cognito included Lambda Authorizer.

## STEP #1 User Pool Creation

https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html

A user pool is a directory to store credentials.

Most Use Cases:

1. Multi-factor authentication
2. Passwords requirements
3. Attributes mappings of users
4. Allow user sign in with username, email or phone number

In this project, we have two user pools to store the customer credentials and service provider credentials. We allow our users to register with their email address and will require the password to have a minimum length of 6 characters, including an uppercase and a number. We are not using MFA just yet.

    CustomerPool:
      Type: "AWS::Cognito::UserPool"
      Properties:
        MfaConfiguration: OFF
        UserPoolName: ${self:custom.customerPoolName}
        UsernameAttributes:
          - email
        Policies:
          PasswordPolicy:
            MinimumLength: 6
            RequireLowercase: False
            RequireNumbers: True
            RequireSymbols: False
            RequireUppercase: True

    ProviderPool:
      Type: "AWS::Cognito::UserPool"
      Properties:
        MfaConfiguration: OFF
        UserPoolName: ${self:custom.providerPoolName}
        UsernameAttributes:
          - email
        Policies:
          PasswordPolicy:
            MinimumLength: 6
            RequireLowercase: False
            RequireNumbers: True
            RequireSymbols: False
            RequireUppercase: True

## STEP #2 User Pool Client Creation

https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpoolclient.html

Each user pool needs an App Client.

Most Use Cases:

1. Allows our apps to issue requests to the Cognito APIs that are normally unauthenticated.
2. Exposes APIs to register, sign in or recover passwords.
3. Configure how the client works
   a. Set CallbackURLs and LogoutURLs (this needs to match our auth portal website domain URL)
   b. Allow implicit OAuthFlows (Note: The Implicit Grant Type is a way for a single-page JavaScript app to get an access token without an intermediate code exchange step, in this case we get JSON Web Token back after the user has authenticated.)
   c. Allow OAuth Scopes (email, phone, etc.)
   d. Supported Identity Provider (Cognito, Google, Facebook)
4. Must reference the user pool id created in this stack or another user pool's UserPoolId

   CustomerPoolClient:
   Type: "AWS::Cognito::UserPoolClient"
   Properties:
   ClientName: ${self:custom.customerUserPoolClientName}
   GenerateSecret: False
   AllowedOAuthFlowsUserPoolClient: true
   AllowedOAuthFlows: - implicit
   AllowedOAuthScopes: - phone - email - openid - profile - aws.cognito.signin.user.admin # cannot have trailing "/"
   CallbackURLs: - http://localhost:3000
   LogoutURLs: - http://localhost:3000
   SupportedIdentityProviders: - COGNITO
   UserPoolId:
   Ref: CustomerPool

   ProviderPoolClient:
   Type: "AWS::Cognito::UserPoolClient"
   Properties:
   ClientName: ${self:custom.providerUserPoolClientName}
   GenerateSecret: False
   AllowedOAuthFlowsUserPoolClient: true
   AllowedOAuthFlows: - implicit
   AllowedOAuthScopes: - phone - email - openid - profile - aws.cognito.signin.user.admin
   CallbackURLs: - http://localhost:3001
   LogoutURLs: - http://localhost:3001
   SupportedIdentityProviders: - COGNITO
   UserPoolId:
   Ref: ProviderPool

## STEP #3 User Pool Client Custom Domain

https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpooldomain.html

For each user pool client, we can add an custom auth portal domain, the Domain string must match:
Pattern: ^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$

We can check it with an regex website

    CustomerAuthDomain:
      Type: AWS::Cognito::UserPoolDomain
      Properties:
        Domain: "petobe-customer-portal"
        UserPoolId:
          Ref: CustomerPool

    ProviderAuthDomain:
      Type: AWS::Cognito::UserPoolDomain
      Properties:
        Domain: "petobe-provider-portal"
        UserPoolId:
          Ref: ProviderPool

## STEP #4 Getting the Hosted UI

We can use AWS Hosted UI to save some time with new user register/sign_in flow.

Every User Pool Client URL Follows this pattern is their URL:

https://<your_domain>/login?response_type=token&client_id=<your_app_client_id>&redirect_uri=<your_callback_url>

And the Redirect after user login will take you to:

https://<your_callback_url>/#id_token=<auth_token>&expires_in=3600&token_type=Bearer

In the Front-end client we need to take the token and store it somewhere, it's up to the dev how it's stored.

## STEP #5 Protecting API Gateway EndPoints

Why:
Our API need to only accept incoming requests if it acknowledges that the user has successfully signed in(JWT Token).

How:
We need a new resource that holds the API Gateway authorizer pointing to the User Pool. We are doing this for both the Customer endpoint as well as the Service Provider Endpoint.

    CustomerAuthorizer:
      DependsOn:
        - ApiGatewayRestApi
      Type: AWS::ApiGateway::Authorizer
      Properties:
        Name: customer-authorizer
        IdentitySource: method.request.header.Authorization
        RestApiId:
          Ref: ApiGatewayRestApi
        Type: COGNITO_USER_POOLS
        ProviderARNs:
          - Fn::GetAtt: [CustomerPool, Arn]

    ProviderAuthorizer:
      DependsOn:
        - ApiGatewayRestApi
      Type: AWS::ApiGateway::Authorizer
      Properties:
        Name: provider-authorizer
        IdentitySource: method.request.header.Authorization
        RestApiId:
          Ref: ApiGatewayRestApi
        Type: COGNITO_USER_POOLS
        ProviderARNs:
          - Fn::GetAtt: [ProviderPool, Arn]

## STEP #6 Protecting EndPoints with Authorizer

The following endpoints are referring to the resource id from our new authorizer resource in order to allow authenticated user to use our api endpoints. 

  registeredCustomer:
    handler: handler.hiCustomer
    events:
      - http:
          path: /customer
          method: get
          authorizer:
            type: COGNITO_USER_POOLS
            authorizerId:
              Ref: CustomerAuthorizer

  registeredProvider:
    handler: handler.hiProvider
    events:
      - http:
          path: /provider
          method: get
          authorizer:
            type: COGNITO_USER_POOLS
            authorizerId:
              Ref: ProviderAuthorizer
