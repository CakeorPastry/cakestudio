local player = game.Players.LocalPlayer
local runService = game:GetService("RunService")
local playerGui = player:WaitForChild("PlayerGui")
local TweenService = game:GetService("TweenService")
local TweenInfoSetting = TweenInfo.new(1, Enum.EasingStyle.Linear)

function randomString()
	local length = math.random(10,20)
	local array = {}
	for i = 1, length do
		array[i] = string.char(math.random(32, 126))
	end
	return table.concat(array)
end

-- GUI Setup
-- local screenGui = Instance.new("ScreenGui", playerGui)
local screenGui = Instance.new("ScreenGui", game.CoreGui)
screenGui.Name = randomString() 
screenGui.ResetOnSpawn = false

local notificationFrame = Instance.new("Frame")
notificationFrame.Size = UDim2.new(0, 626, 0, 59)
notificationFrame.Position = UDim2.new(0.5, 0, 0.268415093, 0)
notificationFrame.AnchorPoint = Vector2.new(0.5, 0.5)
notificationFrame.BackgroundTransparency = 1
notificationFrame.Parent = screenGui
notificationFrame.Name = "Output"

-- Add UIGridLayout
local gridLayout = Instance.new("UIGridLayout")
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.StartCorner = Enum.StartCorner.TopLeft
gridLayout.CellPadding = UDim2.new(0, 0, 0, 0)
gridLayout.CellSize = UDim2.new(1, 0, 0.349999994, 0) -- Matching the TextLabel size
gridLayout.Parent = notificationFrame

function PlaySound(id) 
    --[[
    9070284921 - Beautiful Girls (LOUD) (SHORT)
    97495881842727 - DO NOT REDEEM
    6204175492 - ara ara 2
    7784389087 - DJ Snake - YAMH
    7510781592 - slap oh
    80959855784919 - Man screaming meme sound effect
    
    ]]

    local table = {
        9070284921,
        97495881842727,
        6204175492,
        7784389087,
        7510781592,
        80959855784919
    }

    local Sound = Instance.new("Sound")
    local finalId = id or table[math.random(1, #table)]
    Sound.SoundId = "rbxassetid://"..finalId
    Sound.Parent = workspace
    Sound:Play() 
    Sound.Ended:Wait() 
    Sound:Destroy()
end

-- Function to create notifications
function CreateNotification(text, color, duration)
    local notification = Instance.new("TextLabel")
    notification.Size = UDim2.new(1, 0, 1, 0)
    notification.AnchorPoint = Vector2.new(0.5, 0, 0.5, 0)
    notification.Position = UDim2.new(0, 0, 0, 0)
    notification.TextColor3 = color or Color3.new(1, 1, 1)
    notification.BackgroundTransparency = 1
    -- notification.TextColor3 = Color3.new(1, 1, 1)
    notification.TextSize = 20
    notification.Text = text
    notification.TextTransparency = 0
    notification.TextWrapped = false
    notification.TextScaled = true
    -- print(notification.TextScaled)
    notification.Parent = notificationFrame
    task.spawn(function() 
        PlaySound("9102731048")
    end)
    -- Optional: Add a fade-out effect before deletion
    task.wait(duration or 5)
    local destroyTween = TweenService:Create(notification, TweenInfoSetting, { TextTransparency = 1 })
    destroyTween:Play() 
    destroyTween.Completed:Wait() 
    notification:Destroy() 
end

if game.GameId ~= 1516533665 then
    task.spawn(function() 
        CreateNotification("This script is only for the game \"Piggy\".", Color3.new(255, 0, 0), 5)
        screenGui:Destroy() 
    end)
    PlaySound()
    return
end


if imsorry_pleaseforgiveme_Piggy_partesp_lua_LOADED then
    task.spawn(function()
        CreateNotification("This script is already running!", Color3.new(255, 0, 0), 5)
        screenGui:Destroy() 
    end)
    pcall(function() imsorry_pleaseforgiveme_Piggy_partesp_lua_frame.Position = UDim2.new(0, 10, 0.5, -40) end)
    error("/imsorry/pleaseforgiveme/Piggy/partesp.lua is already running!", 0)
    return
end

pcall(function() getgenv().imsorry_pleaseforgiveme_Piggy_partesp_lua_LOADED = true end)

local frame = Instance.new("Frame", screenGui)
frame.Size = UDim2.new(0, 150, 0, 80)
frame.Position = UDim2.new(0, 10, 0.5, -40)
frame.BackgroundColor3 = Color3.new(0.1, 0.1, 0.1)
frame.Active = true
frame.Draggable = true
frame.Name = randomString() 

pcall(function() getgenv().imsorry_pleaseforgiveme_Piggy_partesp_lua_frame = frame end)


local mainButton = Instance.new("TextButton", frame)
mainButton.Size = UDim2.new(1, -10, 0, 30)
mainButton.Position = UDim2.new(0, 5, 0, 5)
mainButton.Text = "Main: OFF"
mainButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
mainButton.TextColor3 = Color3.new(1, 1, 1)
mainButton.Name = randomString() 

local allButton = Instance.new("TextButton", frame)
allButton.Size = UDim2.new(1, -10, 0, 30)
allButton.Position = UDim2.new(0, 5, 0, 40)
allButton.Text = "All: OFF"
allButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
allButton.TextColor3 = Color3.new(1, 1, 1)
allButton.Name = randomString() 

local mainEnabled, allEnabled = false, false

-- Utility functions
local function isFolderMatch(name)
	return name:gsub("[%d%-]", "") == ""
end

local function isAllMatch(name)
	return name:match("^%d+$")
end

local function hasItemScript(obj)
	return obj:FindFirstChild("ItemPickupScript") and obj.ItemPickupScript:IsA("Script")
end

-- ESP Application
local function applyESP(obj)
	if not obj:IsA("BasePart") then return end

	-- BillboardGui: parented to PlayerGui
	if not screenGui:FindFirstChild("ESP_Billboards") then
		local folder = Instance.new("Folder", screenGui)
		folder.Name = "ESP_Billboards"
	end
	local billboardFolder = screenGui:FindFirstChild("ESP_Billboards")
 local hFolder = Instance.new("Folder", screenGui)
 hFolder.Name = randomString()

	if not obj:FindFirstChild("ESP_Highlight") then
		local highlight = Instance.new("Highlight")
		highlight.Name = "ESP_Highlight"
		highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
		highlight.FillColor = hasItemScript(obj) and Color3.fromRGB(0, 255, 0) or Color3.fromRGB(255, 0, 0)
		highlight.OutlineColor = Color3.new(1, 1, 1)

  highlight.Adornee = obj
  highlight.Parent = hFolder
		-- highlight.Parent = obj
	end

	if not billboardFolder:FindFirstChild(obj:GetFullName()) then
		local billboard = Instance.new("BillboardGui")
		billboard.Name = obj:GetFullName()
		billboard.Size = UDim2.new(0, 100, 0, 25)
		billboard.AlwaysOnTop = true
		billboard.StudsOffset = Vector3.new(0, 2, 0)
		billboard.Adornee = obj
		billboard.Parent = billboardFolder

		local label = Instance.new("TextLabel")
		label.Size = UDim2.new(1, 0, 1, 0)
		label.BackgroundTransparency = 1
		label.TextColor3 = Color3.new(1, 1, 1)
		label.TextStrokeTransparency = 0
		label.TextScaled = true
		label.Font = Enum.Font.SourceSansBold
		label.Text = obj.Name .. (hasItemScript(obj) and " (Item)" or "")
		label.Parent = billboard
	end
end

-- Cleanup
local function removeESP()
	if screenGui:FindFirstChild("ESP_Billboards") then
		screenGui.ESP_Billboards:Destroy()
	end
 --[[
	for _, desc in ipairs(workspace:GetDescendants()) do
		if desc:IsA("BasePart") then
			local h = desc:FindFirstChild("ESP_Highlight")
			if h then h:Destroy() end
		end
	end
 ]]
 hFolder:ClearAllChildren()
end

-- Update loop
runService.RenderStepped:Connect(function()
	if not (mainEnabled or allEnabled) then return end

	for _, obj in ipairs(workspace:GetDescendants()) do
		if mainEnabled and obj:IsA("Folder") and isFolderMatch(obj.Name) then
			for _, child in ipairs(obj:GetChildren()) do
				applyESP(child)
			end
		end

		if allEnabled and obj:IsA("BasePart") and isAllMatch(obj.Name) then
			applyESP(obj)
		end
	end
end)

-- Button toggles
mainButton.Activated:Connect(function()
	mainEnabled = not mainEnabled
	mainButton.Text = "Main: " .. (mainEnabled and "ON" or "OFF")
	if not (mainEnabled or allEnabled) then removeESP() end
end)

allButton.Activated:Connect(function()
	allEnabled = not allEnabled
	allButton.Text = "All: " .. (allEnabled and "ON" or "OFF")
	if not (mainEnabled or allEnabled) then removeESP() end
end)

CreateNotification("TheFuckBoom is a big nigger monkey.", Color3.new(0, 255, 0), 5) 
PlaySound() 