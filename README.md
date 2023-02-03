# Welcome to the Workshop - Event Driven Architecture in AWS

Welcome to united Raffle company incorporated. You are the selected group of developer that have a big challenge ahead! Tomorrow the big Raffle take place. It will be used to enable the audience of the season finale of the big tv-show "Good zombies, Sad zombies" (short GZSZ) to join a big raffle to win a brand new Mercedes.
Now since the big employee layoff in january we unfortunately let all our cloud develop go and you are our new hires. So you have to build this raffle system in one day! Otherwise we will fire you right away!
We think thousands of people will participate in the raffle and it would be catastrophic if we loose any participating customer!
On top of that all the customer data also need to be stored in a database in the old legacy system which uses Kafka as a backpressure mechanism to make sure the on-prem data center isn't exploding once the raffle is live.

Luckily for you, our chief lead architect Sven Serverless is still around and already draw some boxes and lines on the office walls which he thinks is the best and only architecture to build such a system.
Since he is best friend with the CEO, you absolutely have to build the system like he designed it, or you are fired immediately.

## Architecture

![Architecture](./architecture.drawio.svg)
