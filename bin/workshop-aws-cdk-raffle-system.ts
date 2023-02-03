#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WorkshopAwsCdkRaffleSystemStack } from "../lib/stack";

const app = new cdk.App();

new WorkshopAwsCdkRaffleSystemStack(app, "Raffle", {});
