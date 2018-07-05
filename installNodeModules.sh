#! /usr/bin/env bash

echo 'Installing EventStore dependencies...';
cd eventStore && npm install;
echo 'Installing Service A dependencies...';
cd ../serviceA && npm install;
echo 'Installing Service B dependencies...';
cd ../serviceB && npm install;
echo 'Installing Service C dependencies...';
cd ../serviceC && npm install;