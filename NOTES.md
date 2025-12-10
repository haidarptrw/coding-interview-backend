# Implementation Notes

**Candidate:** Nazhif Haidar Putra Wibowo  
**Date:** December 9th 2025  
**Time Spent:** 2 Days

## Main Bugs/Issues Found

### 1. Invalid equal syntax

**Issue:**  Invalid equal syntax in InMemoryTodoRepository.ts and TodoService.ts. they use ==
**Fix:**  Use the === syntax instead of ==
**Impact:** Code now check the condition correctly

### 2. Upsert logic inside Update

**Issue:**  update logic inside InMemoryTodoRepository.ts create new Todo. you should not create new todo inside the update
**Fix:**  Change the block that create new to-do to throw an Error instead.
**Impact:** There will be no unintended create action happening

### 3. SimpleScheduler

**Issue:**  There are no proper cleanup for the scheduled scheduler because the created worker was never stored to a collection to be able to lookup for cleanup
**Fix:**  Add new map to track the scheduled scheduled
**Impact:** Ensure a graceful cleanup when the scheduler stops

(Add more as needed)

---

## How I Fixed Them

### Type Safety Issues

I enforce strict type in each endpoint handler to use Express interface for Request and Response.

### Validation Issues

I added validation to check title, email, and user name to enforce valid format. I use zod to easily do validation.

### Data Integrity Issues

There are no actions for certain use case that was available inside TodoService, to maintain data integrity by only letting TodoService
to be a sole manager for its own state, I added new API method to TodoService so that we don't have to call method from each repository and
let TodoService to be the one who is in charge.

### Logic Errors

I fix logic inside processRemainderDue to filter only the todos that are in "PENDING" status

### Error Handling

I use custom data type for error. each function that throws error must throw the error with ResponseError type defined in ./types.ts

---

## Framework/Database Choices

### HTTP Framework

**Choice:**  ExpressJS
**Reasoning:** It is compatible with the interface where handler use req and res as the parameters, also it is simple and I have used it in some use case

### Database

**Choice:**  
**Reasoning:**

### Other Libraries/Tools

**Choice:**  Zod
**Reasoning:** To ensure type safety, but note that I only used it to validate only small payload properties. If I want to fully refactor it, I have to change the structure of Todo and User type, And I don't want to touch that.

---

## Database Schema Design

(If applicable)

```sql
-- SQL schema or document schema here
```

---

## How to Run My Implementation

### Prerequisites

- PNPM

### Setup Steps

1. Install PNPM if there is no any
2. Run the ```pnpm install``` to install all dependencies

### Running the Application

```bash
pnpm run dev

```

### Running Tests

```bash
pnpm run test
```

---

## Optional Improvements Implemented

- [ ] Authentication/Authorization
- [ ] Pagination
- [ ] Filtering/Sorting
- [ ] Rate Limiting
- [ ] Logging
- [ ] Docker Setup
- [ ] Environment Configuration
- [ ] Integration Tests
- [ ] API Documentation
- [ ] Health Check Endpoint
- [ ] Other: ******\_\_\_******

### Details

---

## Future Improvements

If I had more time, I would add/improve:

1. Integrate with a database
2. Implement Optional Improvements

---

## Assumptions Made

1. 
2.
3.

---

## Challenges Faced

1. I have to ask ChatGPT to know how to set up ExpressJs backend server because it's been a long time since I used it.
2. I am more familiar with JS/TS as a front-end tool rather than back-end. I'm currently using Rust as my go-to back-end language
3. The last experience of me working as back-end developer using TypeScript is using the NextJS API, so this one feels a little bit different.

---

## Additional Comments
