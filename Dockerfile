FROM amazoncorretto:21
ARG JAR_FILE=target/aws-lambda-example-1.0-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
