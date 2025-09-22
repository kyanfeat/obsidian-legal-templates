const { Plugin, Setting, Notice } = require('obsidian');

const DEFAULT_SETTINGS = {
  defaultJurisdiction: 'US-Federal',
  firmName: 'Your Law Firm',
  attorneyName: 'Attorney Name',
  barNumber: 'Bar #12345'
};

class LegalTemplatesPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    // Add ribbon icon
    this.addRibbonIcon('scroll-text', 'Legal Templates', () => {
      new Notice('Legal Templates: Use Command Palette (Ctrl+P) to create templates');
    });

    // Add command palette commands
    this.addCommand({
      id: 'create-contract-template',
      name: 'Create Contract Template',
      callback: () => {
        this.createTemplate('contract');
      }
    });

    this.addCommand({
      id: 'create-memo-template',
      name: 'Create Legal Memo Template',
      callback: () => {
        this.createTemplate('memo');
      }
    });

    this.addCommand({
      id: 'create-client-intake',
      name: 'Create Client Intake Form',
      callback: () => {
        this.createTemplate('intake');
      }
    });

    // Add settings tab
    this.addSettingTab(new LegalTemplatesSettingTab(this.app, this));

    console.log('Legal Templates Plugin loaded');
  }

  onunload() {
    console.log('Legal Templates Plugin unloaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async createTemplate(type) {
    const timestamp = new Date().toISOString().split('T')[0];
    let fileName = '';
    let content = '';

    switch (type) {
      case 'contract':
        fileName = `Contract-${timestamp}.md`;
        content = this.getContractTemplate();
        break;
      case 'memo':
        fileName = `Legal-Memo-${timestamp}.md`;
        content = this.getMemoTemplate();
        break;
      case 'intake':
        fileName = `Client-Intake-${timestamp}.md`;
        content = this.getIntakeTemplate();
        break;
    }

    try {
      const file = await this.app.vault.create(fileName, content);
      await this.app.workspace.getLeaf().openFile(file);
      new Notice(`Created ${type} template: ${fileName}`);
    } catch (error) {
      new Notice(`Error creating template: ${error.message}`);
    }
  }

  getContractTemplate() {
    return `# Contract Template

**Firm:** ${this.settings.firmName}
**Attorney:** ${this.settings.attorneyName} (Bar #${this.settings.barNumber})
**Jurisdiction:** ${this.settings.defaultJurisdiction}
**Date:** ${new Date().toLocaleDateString()}

---

## Contract Terms

### Parties
- **Party A:** [Client Name]
- **Party B:** [Other Party]

### Scope of Work
[Describe the work to be performed]

### Compensation
[Payment terms and amounts]

### Timeline
- **Start Date:** [Date]
- **Completion Date:** [Date]

### Legal Clauses

#### Governing Law
This contract shall be governed by the laws of ${this.settings.defaultJurisdiction}.

#### Dispute Resolution
[Insert dispute resolution clause]

#### Confidentiality
[Insert confidentiality terms]

---

**Attorney Signature:** ${this.settings.attorneyName}
**Date:** _______________

> **Legal Disclaimer:** This template is for informational purposes only and does not constitute legal advice. Consult with a qualified attorney before using this document.
`;
  }

  getMemoTemplate() {
    return `# Legal Memorandum

**TO:** [Recipient]
**FROM:** ${this.settings.attorneyName}
**DATE:** ${new Date().toLocaleDateString()}
**RE:** [Subject Matter]

---

## Executive Summary
[Brief summary of legal conclusions]

## Statement of Facts
[Relevant facts of the case]

## Issues Presented
1. [Legal issue #1]
2. [Legal issue #2]

## Brief Analysis

### Issue 1: [Legal Question]
**Rule:** [Applicable law]
**Analysis:** [Legal reasoning]
**Conclusion:** [Conclusion for this issue]

### Issue 2: [Legal Question]
**Rule:** [Applicable law]
**Analysis:** [Legal reasoning]
**Conclusion:** [Conclusion for this issue]

## Recommendations
[Recommended course of action]

---

**Prepared by:** ${this.settings.attorneyName} (Bar #${this.settings.barNumber})
**Jurisdiction:** ${this.settings.defaultJurisdiction}

> **Privilege Notice:** This document may contain attorney-client privileged information. If you have received this in error, please notify the sender immediately.
`;
  }

  getIntakeTemplate() {
    return `# Client Intake Form

**Attorney:** ${this.settings.attorneyName}
**Firm:** ${this.settings.firmName}
**Date:** ${new Date().toLocaleDateString()}

---

## Client Information

### Personal Details
- **Name:** _______________
- **Phone:** _______________
- **Email:** _______________
- **Address:** _______________

### Emergency Contact
- **Name:** _______________
- **Relationship:** _______________
- **Phone:** _______________

## Legal Matter

### Case Type
- [ ] Contract Dispute
- [ ] Personal Injury
- [ ] Family Law
- [ ] Criminal Defense
- [ ] Business Law
- [ ] Real Estate
- [ ] Other: _______________

### Case Summary
[Brief description of the legal issue]

### Opposing Parties
[Names and details of other parties involved]

### Statute of Limitations
**Deadline:** [Important dates and deadlines]

## Conflict Check
- **Opposing Parties:** [Check for conflicts]
- **Related Entities:** [Any related businesses/individuals]
- **Prior Representation:** [Any history with client/opposing parties]

## Fee Structure
- **Hourly Rate:** $_____ per hour
- **Retainer:** $_____ 
- **Payment Terms:** [Payment schedule]

## Documents Needed
- [ ] Identification
- [ ] Relevant contracts
- [ ] Correspondence
- [ ] Court documents
- [ ] Financial records
- [ ] Other: _______________

---

**Client Signature:** _______________  **Date:** _______________
**Attorney Signature:** ${this.settings.attorneyName}  **Date:** _______________

> **Confidentiality Notice:** All information provided is protected by attorney-client privilege.
`;
  }
}

class LegalTemplatesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Legal Templates Settings' });

    new Setting(containerEl)
      .setName('Firm Name')
      .setDesc('Your law firm name')
      .addText(text => text
        .setPlaceholder('Your Law Firm')
        .setValue(this.plugin.settings.firmName)
        .onChange(async (value) => {
          this.plugin.settings.firmName = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Attorney Name')
      .setDesc('Your full name as an attorney')
      .addText(text => text
        .setPlaceholder('Attorney Name')
        .setValue(this.plugin.settings.attorneyName)
        .onChange(async (value) => {
          this.plugin.settings.attorneyName = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Bar Number')
      .setDesc('Your bar admission number')
      .addText(text => text
        .setPlaceholder('Bar #12345')
        .setValue(this.plugin.settings.barNumber)
        .onChange(async (value) => {
          this.plugin.settings.barNumber = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Default Jurisdiction')
      .setDesc('Default jurisdiction for legal documents')
      .addDropdown(dropdown => dropdown
        .addOption('US-Federal', 'US Federal')
        .addOption('US-California', 'California')
        .addOption('US-New-York', 'New York')
        .addOption('US-Texas', 'Texas')
        .addOption('US-Florida', 'Florida')
        .addOption('UK', 'United Kingdom')
        .addOption('Canada', 'Canada')
        .setValue(this.plugin.settings.defaultJurisdiction)
        .onChange(async (value) => {
          this.plugin.settings.defaultJurisdiction = value;
          await this.plugin.saveSettings();
        }));
  }
}

module.exports = LegalTemplatesPlugin;
