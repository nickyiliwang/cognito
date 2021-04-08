# Serverless Cognito

TODO:
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cognito-userpool.html

1. Front-end portal for Customer and Provider
2. 2 user pools with IDF for bot the customer and provider
3. 2 api gateway routes referring different Cognito user pools
4. Create IAM Roles in template and assign it to different Lambda Functions, (this is for private buckets)
5. IAM Role with Policies to different user pools to get private bucket access (sjh private bucket)

DEMO

1. user sign-up and sign-in confirmation
2.

## Auth Flow

https://drive.google.com/file/d/11f6mdIRf3xaVJ31XHL_F1TMOe97axF_k/view?usp=sharing

## Setup

1. `serverless deploy`

Besides deploying the service, we need to manually configure some details, since CloudFormation falls short. So, in the Cognito Dashboard, select the User Pool and follow the steps below:

1. Select "App client settings", enable Cognito User Pool as a provider and enter the callback and sign out URLs. Select "Implicit grant" as allowed OAuth flow and tick all the scopes
2. Select "Domain name" and create one

## Usage

1. Open a web browser and go to `https://<your_domain>/login?response_type=token&client_id=<your_app_client_id>&redirect_uri=<your_callback_url>`
2. After loging in successfully, you'll be redirected to your calback URL with `id_token` in the query string
3. Put `id_token` in the `Authorization` HTTP header when submitting requests to the API

## Which attributes do you want to verify?

Verification requires users to retrieve a code from their email or phone to confirm ownership. Verification of a phone or email is necessary to automatically confirm users and enable recovery from forgotten passwords. Learn more about email and phone verification.

Email

## How will a user be able to recover their account?

Email only

## Do you want to enable Multi-Factor Authentication (MFA)?

## Domain setup

https://petobe-auth.auth.us-east-1.amazoncognito.com

## customizations for login ui

## IDF and IDF attribute mapping

## Sign in and sign out URLs

Callback URL and sign-out URL

## App client settings

Allowed OAuth Flows  
Implicit grant

Allowed OAuth Scopes  
phone email openid aws.cognito.signin.user.admin profile

## Amazon Cognito domain

https://petobe-auth-portal.auth.us-east-1.amazoncognito.com

Click on Launch Hosted UI to get the URL:

https://petobe-auth-portal.auth.us-east-1.amazoncognito.com/login?client_id=2fagm18aqrd219sjj8hnfe1f3j&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http://localhost:5500
