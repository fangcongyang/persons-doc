# GitHub Authentication Configuration Guide

## Overview

This document describes how to configure HTTPS authentication for GitHub private repositories using Personal Access Tokens (PAT) to avoid repeatedly entering username and password.

## Problem Description

When cloning or pulling from GitHub private repositories using HTTPS, Git repeatedly prompts for username and password, which is inconvenient for development.

## Solution

### Solution Selection

We chose the **GitHub Personal Access Token (PAT)** approach for the following reasons:

- Simple configuration, no need to repeatedly enter authentication information after one-time setup
- Precise control over token permission scopes
- More secure than using account passwords directly

### Configuration Steps

#### 1. Generate GitHub Personal Access Token

1. Log in to your GitHub account
2. Click your avatar in the top right → Settings
3. In the left menu, select Developer settings → Personal access tokens → Tokens (classic)
4. Click Generate new token → Generate new token (classic)
5. Set token expiration time and required permissions (at least repo permission is needed)
6. Click Generate token
7. **Important**: Copy the generated token immediately, its only shown once!

#### 2. Configure Git Remote URL

Embed the PAT into the Git remote URL:

```bash
# Format
git remote set-url origin https://<USERNAME>:<TOKEN>@github.com/<REPO_OWNER>/<REPO_NAME>.git

# Example
git remote set-url origin https://username:your-token-here@github.com/username/repository.git
```

#### 3. Verify Configuration

```bash
# View remote repository configuration
git remote -v

# Test pull operation
git pull
```

### Current Project Configuration

This project has GitHub PAT authentication configured:

- **Authentication Method**: PAT embedded in remote URL

## Security Notes

1. **Do NOT commit PAT to public repositories**
2. Rotate PAT regularly
3. Use different PATs for different projects
4. Set reasonable token expiration times
5. Grant only necessary minimum permissions

## Alternative Solutions

### Git Credential Storage

If you dont want to embed the token in the URL, you can also use Git credential storage:

```bash
# Enable credential storage
git config --global credential.helper store

# Credentials will be saved after first entry
```

## Troubleshooting

### Authentication Failed

- Confirm PAT is not expired
- Confirm PAT has sufficient permissions
- Check if remote URL format is correct

### Changing PAT

```bash
# Reset remote URL with new PAT
git remote set-url origin https://<USERNAME>:<NEW_TOKEN>@github.com/<REPO_OWNER>/<REPO_NAME>.git
```
