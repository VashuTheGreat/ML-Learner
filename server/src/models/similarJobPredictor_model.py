import torch
from torch.utils.data import DataLoader,Dataset
from src.Predictors.constants import DEVICE
class ResumeDataset(Dataset):
    def __init__(self,data):
        self.sample=[prepare_input(x) for _,x in data.iterrows()]

    def __len__(self):
        return len(self.sample)


    def __getitem__(self, idx):
        text,labels=self.sample[idx]

        enc=tokenize(text)

        return {
            "input_idx":enc['input_ids'].squeeze(0),
            "attention_mask":enc['attention_mask'].squeeze(0),
            "labels":torch.tensor(labels,dtype=torch.float)

        }
    


import torch.nn as nn
from transformers import AutoModel

class ResumeScore(nn.Module):
    def __init__(self, ):
        super().__init__()

        self.bert=AutoModel.from_pretrained("bert-base-uncased")

        self.regressor=nn.Sequential(
            nn.Linear(768,256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256,2) # macro ,micro

        )

    def forward(self,input_ids,attention_mask):
        outputs=self.bert(input_ids,attention_mask)

        cls_output=outputs.last_hidden_state[:,0] # cls token

        return self.regressor(cls_output)



# dataset=ResumeDataset(data=df)

# dataset_loader=DataLoader(dataset=dataset,batch_size=8,shuffle=True)


# optimizer=torch.optim.AdamW(model.parameters(),lr=2e-5)

# loss_fn=nn.MSELoss()

